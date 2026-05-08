from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import random
from datetime import datetime, timedelta

from .. import models, schemas
from ..database import get_db
from ..auth_utils import verificar_senha, criar_token_acesso, gerar_hash_senha

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/login", response_model=schemas.Token)
def login(credenciais: schemas.UsuarioLogin, db: Session = Depends(get_db)):

    usuario = db.query(models.Usuario).filter(models.Usuario.email == credenciais.email).first()
    
    if not usuario or not verificar_senha(credenciais.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    dados_token = {
        "sub": usuario.email, 
        "id": usuario.id, 
        "nivel_acesso": usuario.nivel_acesso
    }
    
    token_jwt = criar_token_acesso(dados=dados_token)
    
    return {"access_token": token_jwt, "token_type": "bearer"}

@router.post("/registrar_admin", response_model=schemas.UsuarioResponse, status_code=status.HTTP_201_CREATED)
def criar_primeiro_usuario(usuario: schemas.UsuarioLogin, nome: str, db: Session = Depends(get_db)):
    usuario_existe = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if usuario_existe:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
        
    novo_usuario = models.Usuario(
        nome=nome,
        email=usuario.email,
        senha_hash=gerar_hash_senha(usuario.senha),
        nivel_acesso="Administrador"
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario

@router.post("/recuperar_senha")
def recuperar_senha(request: schemas.RecuperarSenha, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.email == request.email).first()

    if not usuario:
        raise HTTPException(
            status_code=404, 
            detail="Verifique o e-mail e tente novamente."
        )
    
    codigo = f"{random.randint(100000, 999999)}"
    expiracao = datetime.now() + timedelta(minutes=15)
    
    db.query(models.CodigoRecuperacao).filter(models.CodigoRecuperacao.email == request.email).delete()
    novo_codigo = models.CodigoRecuperacao(email=request.email, codigo=codigo, expiracao=expiracao)
    db.add(novo_codigo)
    db.commit()
    
    print("\n" + "="*30)
    print(f"E-MAIL PARA: {request.email}")
    print(f"CÓDIGO DE RECUPERAÇÃO: {codigo}")
    print("="*30 + "\n")
    
    return {"message": "Código enviado com sucesso."}

@router.post("/verificar_codigo")
def verificar_codigo(request: schemas.VerificarCodigo, db: Session = Depends(get_db)):
    db_codigo = db.query(models.CodigoRecuperacao).filter(
        models.CodigoRecuperacao.email == request.email,
        models.CodigoRecuperacao.codigo == request.code
    ).first()
    
    if not db_codigo or db_codigo.expiracao < datetime.now():
        raise HTTPException(status_code=400, detail="Código inválido ou expirado.")
    
    return {"message": "Código válido."}

@router.post("/nova_senha")
def nova_senha(request: schemas.NovaSenha, db: Session = Depends(get_db)):
    db_codigo = db.query(models.CodigoRecuperacao).filter(
        models.CodigoRecuperacao.email == request.email,
        models.CodigoRecuperacao.codigo == request.code
    ).first()
    
    if not db_codigo:
        raise HTTPException(status_code=400, detail="Ação não autorizada.")
        
    usuario = db.query(models.Usuario).filter(models.Usuario.email == request.email).first()
    usuario.senha_hash = gerar_hash_senha(request.nova_senha)
    
    db.delete(db_codigo)
    db.commit()
    
    return {"message": "Senha alterada com sucesso."}