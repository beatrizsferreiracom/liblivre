from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from ..import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/livros",
    tags=["Catálogo de Livros"]
)

@router.post("/", response_model=schemas.LivroResponse, status_code=status.HTTP_201_CREATED)
def criar_livro(livro: schemas.LivroCreate, db: Session = Depends(get_db)):

    autor_existe = db.query(models.Autor).filter(models.Autor.id == livro.autor_id).first()
    if not autor_existe:
        raise HTTPException(status_code=404, detail="Autor não encontrado no banco de dados.")
    
    categoria_existe = db.query(models.Categoria).filter(models.Categoria.id == livro.categoria_id).first()
    if not categoria_existe:
        raise HTTPException(status_code=404, detail="Categoria não encontrada no banco de dados.")

    novo_livro = models.Livro(**livro.model_dump())

    db.add(novo_livro)
    db.commit
    db.refresh(novo_livro)

    return novo_livro

@router.get("/", response_model=List[schemas.LivroResponse])
def listar_livros(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):

    livros = db.query(models.Livro).filter(models.Livro.is_ativo == True).offset(skip).limit(limit).all()

    return livros

@router.put("/{livro_id}", response_model=schemas.LivroResponse)
def editar_livro(livro_id: int, livro_atualizado: schemas.LivroCreate, db: Session = Depends(get_db)):
    livro = db.query(models.Livro).filter(models.Livro.id == livro_id).first()
    
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado.")

    for key, value in livro_atualizado.model_dump().items():
        setattr(livro, key, value)
        
    db.commit()
    db.refresh(livro)
    return livro

@router.delete("/{livro_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_livro(livro_id: int, db: Session = Depends(get_db)):
    livro = db.query(models.Livro).filter(models.Livro.id == livro_id).first()
    
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado.")
    
    try:
        db.delete(livro)
        db.commit()
    except IntegrityError:
        db.rollback() 
        raise HTTPException(
            status_code=400, 
            detail="Não é possível excluir este livro, pois ele possui histórico de empréstimos vinculados."
        )
    return