import mongoose from 'mongoose';
import Usuario, { IUsuarioModel, IUsuario } from '../models/Usuario';
import OrganizacionService from './Organizacion';

const createUsuario = async (data: Partial<IUsuario>): Promise<IUsuarioModel> => {
    const usuario = new Usuario({
        _id: new mongoose.Types.ObjectId(),
        ...data
    });
    const savedUsuario = await usuario.save();

    if (savedUsuario.organizacion) {
        await OrganizacionService.addUsuarioToOrganizacion(savedUsuario.organizacion, savedUsuario._id);
    }

    return savedUsuario;
};

const getUsuario = async (usuarioId: string): Promise<IUsuarioModel | null> => {
    return await Usuario.findById(usuarioId).populate('organizacion');
};

const getAllUsuarios = async (): Promise<IUsuarioModel[]> => {
    return await Usuario.find().populate('organizacion');
};

const updateUsuario = async (usuarioId: string, data: Partial<IUsuario>): Promise<IUsuarioModel | null> => {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) return null;

    const oldOrganizacion = usuario.organizacion;
    usuario.set(data);
    const updatedUsuario = await usuario.save();

    if (data.organizacion && String(oldOrganizacion) !== String(data.organizacion)) {
        if (oldOrganizacion) {
            await OrganizacionService.removeUsuarioFromOrganizacion(oldOrganizacion, updatedUsuario._id);
        }
        await OrganizacionService.addUsuarioToOrganizacion(data.organizacion, updatedUsuario._id);
    }

    return updatedUsuario;
};

const deleteUsuario = async (usuarioId: string): Promise<IUsuarioModel | null> => {
    const deletedUsuario = await Usuario.findByIdAndDelete(usuarioId);

    if (deletedUsuario && deletedUsuario.organizacion) {
        await OrganizacionService.removeUsuarioFromOrganizacion(deletedUsuario.organizacion, deletedUsuario._id);
    }
    return deletedUsuario;
};

export default { createUsuario, getUsuario, getAllUsuarios, updateUsuario, deleteUsuario };