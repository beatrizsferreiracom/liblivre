from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/categorias",
    tags=["Categorias"]
)

@router.post("/", response_model=schemas.CategoriaResponse)
def criar_categoria(categoria: schemas.CategoriaCreate, db: Session = Depends(get_db)):

    nova_categoria = models.Categoria(**categoria.model_dump())
    db.add(nova_categoria)
    db.commit()
    db.refresh(nova_categoria)

    return nova_categoria

@router.get("/", response_model=List[schemas.CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(models.Categoria).all()

@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_categoria(categoria_id: int, db: Session = Depends(get_db)):
    categoria = db.query(models.Categoria).filter(models.Categoria.id == categoria_id).first()
    
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")
    
    try:
        db.delete(categoria)
        db.commit()
    except IntegrityError:
        db.rollback() 
        raise HTTPException(
            status_code=400, 
            detail="Não é possível excluir esta categoria, pois ela possui histórico de empréstimos vinculados."
        )
    return