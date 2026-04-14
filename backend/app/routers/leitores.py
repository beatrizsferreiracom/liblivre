from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from datetime import date
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/leitores", 
    tags=["Leitores"]
    )

@router.post("/", response_model=schemas.LeitorResponse, status_code=status.HTTP_201_CREATED)
def criar_leitor(leitor: schemas.LeitorCreate, db: Session = Depends(get_db)):

    novo_leitor = models.Leitor(**leitor.model_dump())

    hoje = date.today()
    nascimento = novo_leitor.data_nascimento

    idade = hoje.year - nascimento.year - ((hoje.month, hoje.day) < (nascimento.month, nascimento.day))

    if idade < 12:
        if not novo_leitor.nome_responsavel or not novo_leitor.telefone_responsavel:
            raise HTTPException(
                status_code=400, 
                detail="Leitores menores de 12 anos devem obrigatoriamente ter nome e telefone do responsável."
            )
    else:
        novo_leitor.nome_responsavel = None
        novo_leitor.telefone_responsavel = None
    
    db.add(novo_leitor)
    db.commit()
    db.refresh(novo_leitor)

    return novo_leitor

@router.get("/", response_model=List[schemas.LeitorResponse])
def listar_leitores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Leitor).filter(models.Leitor.is_ativo == True).offset(skip).limit(limit).all()

@router.patch("/{leitor_id}/desativar", status_code=status.HTTP_204_NO_CONTENT)
def desativar_leitor(leitor_id: int, db: Session = Depends(get_db)):
    
    leitor = db.query(models.Leitor).filter(models.Leitor.id == leitor_id).first()
    if not leitor:
        raise HTTPException(status_code=404, detail="Leitor não encontrado.")
    
    leitor.is_ativo = False
    db.commit()
    
    return

@router.put("/{leitor_id}", response_model=schemas.LeitorResponse)
def editar_leitor(leitor_id: int, leitor_atualizado: schemas.LeitorCreate, db: Session = Depends(get_db)):
    leitor = db.query(models.Leitor).filter(models.Leitor.id == leitor_id).first()
    
    if not leitor:
        raise HTTPException(status_code=404, detail="Leitor não encontrado.")

    hoje = date.today()
    nascimento = leitor_atualizado.data_nascimento

    idade = hoje.year - nascimento.year - ((hoje.month, hoje.day) < (nascimento.month, nascimento.day))

    if idade < 12:
        if not leitor_atualizado.nome_responsavel or not leitor_atualizado.telefone_responsavel:
            raise HTTPException(
                status_code=400, 
                detail="Leitores menores de 12 anos devem obrigatoriamente ter nome e telefone do responsável."
            )
    else:
        leitor_atualizado.nome_responsavel = None
        leitor_atualizado.telefone_responsavel = None

    for key, value in leitor_atualizado.model_dump().items():
        setattr(leitor, key, value)
        
    db.commit()
    db.refresh(leitor)
    return leitor

@router.delete("/{leitor_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_leitor(leitor_id: int, db: Session = Depends(get_db)):
    leitor = db.query(models.Leitor).filter(models.Leitor.id == leitor_id).first()
    
    if not leitor:
        raise HTTPException(status_code=404, detail="Leitor não encontrado.")
    
    try:
        db.delete(leitor)
        db.commit()
    except IntegrityError:
        db.rollback() 
        raise HTTPException(
            status_code=400, 
            detail="Não é possível excluir este leitor, pois ele possui histórico de empréstimos vinculados."
        )
    return