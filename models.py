from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db import Base

class Region(Base):
    __tablename__ = 'region'
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(255), nullable=False)
    
    comunas = relationship("Comuna", back_populates="region")

class Comuna(Base):
    __tablename__ = 'comuna'
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(255), nullable=False)
    region_id = Column(Integer, ForeignKey('region.id'), nullable=False)
    
    region = relationship("Region", back_populates="comunas")

class Ave(Base):
    __tablename__ = 'ave'
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(255), nullable=False)
    tipo = Column(String(255), nullable=False)

class Voluntario(Base):
    __tablename__ = 'voluntario'
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre_completo = Column(String(155), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    contrasenna = Column(String(255), nullable=False)
    comuna_id = Column(Integer, ForeignKey('comuna.id'), nullable=False)

    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())
    
    comuna = relationship("Comuna")
    avistamientos = relationship("Avistamiento", back_populates="voluntario", cascade="all, delete-orphan")

class Avistamiento(Base):
    __tablename__ = 'avistamiento'
    id = Column(Integer, primary_key=True, autoincrement=True)
    fecha = Column(String(50), nullable=False)
    hora = Column(String(50), nullable=False)
    lugar = Column(String(255), nullable=False)
    
    ave_id = Column(Integer, ForeignKey('ave.id'), nullable=False)
    voluntario_id = Column(Integer, ForeignKey('voluntario.id'), nullable=False)
    
    voluntario = relationship("Voluntario", back_populates="avistamientos")
    ave = relationship("Ave")
    registros = relationship("Registro", back_populates="avistamiento", cascade="all, delete-orphan")

class Registro(Base):
    __tablename__ = 'registro'
    id = Column(Integer, primary_key=True, autoincrement=True)
    ruta_archivo = Column(String(255), nullable=False)
    nombre_archivo = Column(String(255), nullable=False)
    avistamiento_id = Column(Integer, ForeignKey('avistamiento.id'), nullable=False)
    
    avistamiento = relationship("Avistamiento", back_populates="registros")
