from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database, auth_utils

router = APIRouter(prefix="/perfil", tags=["Perfil"])

@router.get("/", response_model=schemas.UsuarioResponse)
def ler_perfil(current_user: models.Usuario = Depends(auth_utils.usuario_atual)):
    return current_user

@router.put("/")
def atualizar_perfil(
    dados: schemas.UsuarioUpdate, 
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth_utils.usuario_atual)
):
    if dados.email != current_user.email:
        email_em_uso = db.query(models.Usuario).filter(models.Usuario.email == dados.email).first()
        if email_em_uso:
            raise HTTPException(status_code=400, detail="Este e-mail já está sendo usado por outro perfil.")

    current_user.nome = dados.nome
    current_user.email = dados.email
    
    # Se enviou senha, gera um novo Hash
    if dados.senha:
        current_user.senha_hash = auth_utils.gerar_hash_senha(dados.senha)
        
    db.commit()
    db.refresh(current_user)
    return {"message": "Perfil atualizado com sucesso!"}