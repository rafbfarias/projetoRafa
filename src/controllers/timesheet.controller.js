const KeyLog = require('../models/timesheet.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// Função auxiliar para gerar um ID único para o keyLog
const generateKeyLogId = () => {
  return 'KL' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);
};

// Função auxiliar para preencher dados do usuário
const populateUserData = async (timesheetData) => {
  if (timesheetData.refUserId) {
    try {
      const user = await User.findById(timesheetData.refUserId);
      if (user) {
        // Preencher automaticamente o nome e outros campos se não estiverem definidos
        if (!timesheetData.name) {
          timesheetData.name = user.name;
        }
        if (!timesheetData.employeeId && user.employeeId) {
          timesheetData.employeeId = user.employeeId;
        }
        if (!timesheetData.position && user.position) {
          timesheetData.position = user.position;
        }
        if (!timesheetData.role && user.role) {
          timesheetData.role = user.role;
        }
        if (!timesheetData.unit && user.unit) {
          timesheetData.unit = user.unit;
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  }
  return timesheetData;
};

// Função auxiliar para calcular o total de horas
const calculateTotalHours = (timeIn, timeOut, breakStartTime, breakEndTime) => {
  const start = new Date(timeIn);
  const end = new Date(timeOut);
  
  // Calcular a diferença em milissegundos
  let diffMs = end - start;
  
  // Subtrair o tempo de intervalo, se houver
  if (breakStartTime && breakEndTime) {
    const breakStart = new Date(breakStartTime);
    const breakEnd = new Date(breakEndTime);
    const breakDiffMs = breakEnd - breakStart;
    diffMs -= breakDiffMs;
  }
  
  // Converter para horas, minutos e segundos
  const diffSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;
  
  // Formatar como string HH:MM:SS
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Criar novo registro
exports.create = async (req, res) => {
  try {
    // Gera um ID único para o keyLog
    const keyLogId = generateKeyLogId();
    
    // Prepara os dados do timesheet
    let timesheetData = {
      ...req.body,
      keyLogId,
      day: new Date(req.body.date).toLocaleDateString('pt-BR', { weekday: 'long' })
    };
    
    // Preenche os dados do usuário
    timesheetData = await populateUserData(timesheetData);
    
    // Calcula o total de horas trabalhadas
    if (timesheetData.timeIn && timesheetData.timeOut) {
      timesheetData.totalHours = calculateTotalHours(
        timesheetData.timeIn, 
        timesheetData.timeOut,
        timesheetData.breakStartTime,
        timesheetData.breakEndTime
      );
    }
    
    // Cria o novo registro
    const keyLog = new KeyLog(timesheetData);
    const savedKeyLog = await keyLog.save();
    
    res.status(201).json(savedKeyLog);
  } catch (error) {
    console.error('Erro ao criar registro de ponto:', error);
    res.status(500).json({ message: error.message });
  }
};

// Buscar todos os registros
exports.findAll = async (req, res) => {
  try {
    const keyLogs = await KeyLog.find().sort({ date: -1 });
    res.json(keyLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buscar registro por ID
exports.findOne = async (req, res) => {
  try {
    const keyLog = await KeyLog.findById(req.params.id);
    if (!keyLog) {
      return res.status(404).json({ message: 'Registro não encontrado' });
    }
    res.json(keyLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Atualizar registro
exports.update = async (req, res) => {
  try {
    let updateData = { ...req.body };
    
    // Se o refUserId foi alterado, atualiza os dados do usuário
    if (req.body.refUserId) {
      updateData = await populateUserData(updateData);
    }
    
    // Recalcula o total de horas se necessário
    const keyLog = await KeyLog.findById(req.params.id);
    if (keyLog) {
      const timeIn = updateData.timeIn || keyLog.timeIn;
      const timeOut = updateData.timeOut || keyLog.timeOut;
      const breakStartTime = updateData.breakStartTime || keyLog.breakStartTime;
      const breakEndTime = updateData.breakEndTime || keyLog.breakEndTime;
      
      if (timeIn && timeOut) {
        updateData.totalHours = calculateTotalHours(timeIn, timeOut, breakStartTime, breakEndTime);
      }
    }
    
    const updatedKeyLog = await KeyLog.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    if (!updatedKeyLog) {
      return res.status(404).json({ message: 'Registro não encontrado' });
    }
    
    res.json(updatedKeyLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buscar registros por usuário
exports.findByUser = async (req, res) => {
  try {
    const keyLogs = await KeyLog.find({ refUserId: req.params.userId }).sort({ date: -1 });
    res.json(keyLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buscar registros por unidade
exports.findByUnit = async (req, res) => {
  try {
    const keyLogs = await KeyLog.find({ unit: req.params.unit }).sort({ date: -1 });
    res.json(keyLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Excluir registro
exports.delete = async (req, res) => {
  try {
    const keyLog = await KeyLog.findByIdAndDelete(req.params.id);
    
    if (!keyLog) {
      return res.status(404).json({ message: 'Registro não encontrado' });
    }
    
    res.json({ message: 'Registro excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir registro', error: error.message });
  }
};

// Exportar relatório
exports.export = async (req, res) => {
  try {
    // Implementar exportação para Excel
    res.status(501).json({ message: 'Funcionalidade ainda não implementada' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao exportar relatório', error: error.message });
  }
}; 