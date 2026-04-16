from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from datetime import date
from .. import models, schemas
from ..database import get_db
from .. utils import calcular_data_devolucao

router = APIRouter(
    prefix="/emprestimos", 
    tags=["Empréstimos"]
    )

#Empréstimos
@router.post("/", response_model=schemas.EmprestimoResponse, status_code=status.HTTP_201_CREATED)
def registrar_emprestimo(emprestimo: schemas.EmprestimoCreate, db: Session = Depends(get_db)):
    
    hoje = date.today()

    leitor = db.query(models.Leitor).filter(models.Leitor.id == emprestimo.leitor_id).first()
    if not leitor or not leitor.is_ativo:
        raise HTTPException(status_code=400, detail="Leitor não existe ou está desativado.")

    atrasos = db.query(models.Emprestimo).filter(
        models.Emprestimo.leitor_id == leitor.id,
        models.Emprestimo.data_devolucao_real == None,
        models.Emprestimo.data_devolucao_prevista < hoje   
    ).first()

    if atrasos:
        raise HTTPException(status_code=400, detail="Operação bloqueada: O leitor possui livros em atraso.")
    
    livro = db.query(models.Livro).filter(models.Livro.id == emprestimo.livro_id).first()
    
    if not livro or not livro.is_ativo:
        raise HTTPException(status_code=404, detail="Livro não encontrado no catálogo.")
        
    if livro.quantidade_emprestada >= livro.quantidade_total:
        raise HTTPException(status_code=400, detail="Livro indisponível no momento. Todas as cópias estão emprestadas.")
    
    data_prevista = calcular_data_devolucao(hoje)

    novo_emprestimo = models.Emprestimo(
        livro_id=livro.id,
        leitor_id=leitor.id,
        data_emprestimo=hoje,
        data_devolucao_prevista=data_prevista,
        status="No Prazo"
    )

    livro.quantidade_emprestada += 1

    db.add(novo_emprestimo)
    db.commit()
    db.refresh(novo_emprestimo)

    return novo_emprestimo

#Devolução
@router.patch("/{emprestimo_id}/devolver", response_model=schemas.EmprestimoResponse)
def registrar_devolucao(emprestimo_id: int, db: Session = Depends(get_db)):

    hoje = date.today()

    emprestimo = db.query(models.Emprestimo).filter(models.Emprestimo.id == emprestimo_id).first()

    if not emprestimo:
        raise HTTPException(status_code=404, detail="Registro de empréstimo não encontrado.")

    if emprestimo.data_devolucao_real is not None:
        raise HTTPException(status_code=400, detail="Este livro já consta como devolvido no sistema.")

    livro = db.query(models.Livro).filter(models.Livro.id == emprestimo.livro_id).first()
    
    if not livro:
        raise HTTPException(status_code=404, detail="Livro associado não encontrado no catálogo.")

    emprestimo.data_devolucao_real = hoje
    emprestimo.status = "Devolvido"

    if livro.quantidade_emprestada > 0:
        livro.quantidade_emprestada -= 1

    db.commit()
    db.refresh(emprestimo)
    
    return emprestimo

#Listagem com atualização de status
@router.get("/", response_model=List[schemas.EmprestimoResponse])
def listar_emprestimos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    hoje = date.today()
    
    emprestimos = db.query(models.Emprestimo).offset(skip).limit(limit).all()
    
    houve_alteracao = False

    for emp in emprestimos:
        if emp.data_devolucao_real is None:
            if hoje > emp.data_devolucao_prevista and emp.status != "Atrasado":
                emp.status = "Atrasado"
                houve_alteracao = True
    
    if houve_alteracao:
        db.commit()

    return emprestimos