from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/autores", 
    tags=["Autores"]
)

@router.post("/", response_model=schemas.AutorResponse)
def criar_autor(autor: schemas.AutorCreate, db: Session = Depends(get_db)):

    novo_autor = models.Autor(**autor.model_dump())
    db.add(novo_autor)
    db.commit()
    db.refresh(novo_autor)

    return novo_autor

@router.get("/", response_model=List[schemas.AutorResponse])
def listar_autores(db: Session = Depends(get_db)):
    return db.query(models.Autor).all()

@router.delete("/{autor_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_autor(autor_id: int, db: Session = Depends(get_db)):
    autor = db.query(models.Autor).filter(models.Autor.id == autor_id).first()
    
    if not autor:
        raise HTTPException(status_code=404, detail="Autor não encontrado.")
    
    try:
        db.delete(autor)
        db.commit()
    except IntegrityError:
        db.rollback() 
        raise HTTPException(
            status_code=400, 
            detail="Não é possível excluir este autor, pois ele possui histórico de empréstimos vinculados."
        )
    return