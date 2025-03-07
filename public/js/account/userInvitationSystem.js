import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building, 
  Briefcase,
  Mail, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  Search,
  Clock,
  AlertCircle,
  FileText,
  Check,
  X
} from 'lucide-react';

const UserInvitationSystem = () => {
  // Estado para controle de visualização
  const [activeTab, setActiveTab] = useState('send');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [invitationMessage, setInvitationMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentInvitation, setCurrentInvitation] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Dados simulados
  const companies = [
    { id: 1, companyName: 'Plateiapositiva, Lda', companyCode: 'PLT', companyVATNumber: '123456789', companyStatus: 'Ativa' },
    { id: 2, companyName: 'Coffee Plus, Lda', companyCode: 'CPL', companyVATNumber: '987654321', companyStatus: 'Ativa' }
  ];
  
  const units = [
    { id: 1, unitName: 'Matosinhos', unitCode: 'MAT', companyId: 1, city: 'Matosinhos', seatingCapacity: 80 },
    { id: 2, unitName: 'Porto', unitCode: 'POR', companyId: 1, city: 'Porto', seatingCapacity: 60 },
    { id: 3, unitName: 'Lisboa', unitCode: 'LIS', companyId: 2, city: 'Lisboa', seatingCapacity: 75 },
    { id: 4, unitName: 'Braga', unitCode: 'BRG', companyId: 2, city: 'Braga', seatingCapacity: 50 }
  ];
  
  const contracts = [
    { id: 1, contractId: 'CONT-2025-001', company: 'Plateiapositiva, Lda', position: 'Barista', role: 'Atendente', contractType: 'Tempo Integral', hoursPerWeek: 40, startDate: '2025-04-01', endDate: '2026-03-31', status: 'Pré-Contrato' },
    { id: 2, contractId: 'CONT-2025-002', company: 'Plateiapositiva, Lda', position: 'Gerente', role: 'Gerente de Unidade', contractType: 'Tempo Integral', hoursPerWeek: 40, startDate: '2025-04-01', endDate: '2026-03-31', status: 'Pré-Contrato' },
    { id: 3, contractId: 'CONT-2025-003', company: 'Coffee Plus, Lda', position: 'Caixa', role: 'Atendente', contractType: 'Meio Período', hoursPerWeek: 20, startDate: '2025-04-15', endDate: '2025-10-14', status: 'Pré-Contrato' }
  ];
  
  const [invitations, setInvitations] = useState([
    { 
      id: 1, 
      email: 'maria.silva@example.com', 
      name: 'Maria Silva',
      company: companies[0], 
      units: [units[0]], 
      contract: contracts[0], 
      status: 'pending', 
      createdAt: '2025-03-01T10:00:00.000Z',
      expiresAt: '2025-03-08T10:00:00.000Z',
      message: 'Olá Maria, gostaríamos de convidá-la para fazer parte da nossa equipe.'
    },
    { 
      id: 2, 
      email: 'joao.santos@example.com', 
      name: 'João Santos',
      company: companies[0], 
      units: [units[0], units[1]], 
      contract: contracts[1], 
      status: 'accepted', 
      createdAt: '2025-02-20T14:30:00.000Z',
      acceptedAt: '2025-02-21T09:15:00.000Z',
      message: 'Olá João, estamos muito animados para tê-lo em nossa equipe!'
    },
    { 
      id: 3, 
      email: 'ana.pereira@example.com', 
      name: 'Ana Pereira',
      company: companies[1], 
      units: [units[2]], 
      contract: null, 
      status: 'rejected', 
      createdAt: '2025-02-15T11:20:00.000Z',
      rejectedAt: '2025-02-16T16:45:00.000Z',
      message: 'Olá Ana, gostaríamos de convidá-la para fazer parte da nossa unidade de Lisboa.'
    },
    { 
      id: 4, 
      email: 'carlos.oliveira@example.com', 
      name: 'Carlos Oliveira',
      company: companies[1], 
      units: [units[2], units[3]], 
      contract: contracts[2], 
      status: 'expired', 
      createdAt: '2025-02-01T08:45:00.000Z',
      expiresAt: '2025-02-08T08:45:00.000Z',
      message: 'Olá Carlos, temos uma oportunidade para você em nossas unidades.'
    }
  ]);
  
  // Efeito para filtrar unidades baseadas na empresa selecionada
  const filteredUnits = units.filter(unit => 
    selectedCompany ? unit.companyId === selectedCompany.id : true
  );
  
  // Efeito para filtrar contratos baseados na empresa selecionada
  const filteredContracts = contracts.filter(contract => 
    selectedCompany ? contract.company === selectedCompany.companyName : true
  );
  
  // Filtrar convites com base no status
  const filteredInvitations = invitations.filter(invitation => {
    if (filterStatus === 'all') return true;
    return invitation.status === filterStatus;
  });
  
  // Manipuladores de eventos
  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setSelectedUnits([]);
    setSelectedContract(null);
  };
  
  const handleUnitSelect = (unit) => {
    if (selectedUnits.some(u => u.id === unit.id)) {
      setSelectedUnits(selectedUnits.filter(u => u.id !== unit.id));
    } else {
      setSelectedUnits([...selectedUnits, unit]);
    }
  };
  
  const handleContractSelect = (contract) => {
    setSelectedContract(contract);
  };
  
  const handleInvitationSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedCompany) {
      alert('Por favor, selecione uma empresa');
      return;
    }
    
    if (!searchEmail) {
      alert('Por favor, insira um email válido');
      return;
    }
    
    // Criar novo convite
    const newInvitation = {
      id: invitations.length + 1,
      email: searchEmail,
      name: searchEmail.split('@')[0].replace('.', ' '),
      company: selectedCompany,
      units: selectedUnits,
      contract: selectedContract,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      message: invitationMessage || `Olá, gostaríamos de convidá-lo(a) para fazer parte da ${selectedCompany.companyName}.`
    };
    
    setInvitations([...invitations, newInvitation]);
    
    // Resetar formulário
    setSearchEmail('');
    setSelectedCompany(null);
    setSelectedUnits([]);
    setSelectedContract(null);
    setInvitationMessage('');
    
    // Mostrar confirmação
    setModalType('success');
    setShowModal(true);
  };
  
  const handleViewInvitation = (invitation) => {
    setCurrentInvitation(invitation);
    setModalType('view');
    setShowModal(true);
  };
  
  const handleResendInvitation = (invitation) => {
    // Atualizar convite com nova data de expiração
    const updatedInvitations = invitations.map(inv => {
      if (inv.id === invitation.id) {
        return {
          ...inv,
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
      }
      return inv;
    });
    
    setInvitations(updatedInvitations);
    setModalType('resent');
    setShowModal(true);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };
  
  // Formatação de data
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };
  
  // Obter texto para status
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'accepted':
        return 'Aceito';
      case 'rejected':
        return 'Recusado';
      case 'expired':
        return 'Expirado';
      default:
        return status;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 fixed left-0 right-0 top-0 z-30">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Sistema de Convites</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center">
                <span className="text-gray-700 font-medium">AS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Conteúdo Principal */}
      <div className="pt-20 px-4 pb-6">
        {/* Navegação por Tabs */}
        <div className="border-b border-gray-200 mb-5">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
            <li className="mr-2">
              <button 
                className={`inline-flex items-center justify-center p-4 rounded-t-lg group ${activeTab === 'send' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300'}`}
                onClick={() => setActiveTab('send')}
              >
                <UserPlus className={`mr-2 w-5 h-5 ${activeTab === 'send' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                Enviar Convite
              </button>
            </li>
            <li className="mr-2">
              <button 
                className={`inline-flex items-center justify-center p-4 rounded-t-lg group ${activeTab === 'manage' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300'}`}
                onClick={() => setActiveTab('manage')}
              >
                <Mail className={`mr-2 w-5 h-5 ${activeTab === 'manage' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                Gerenciar Convites
              </button>
            </li>
          </ul>
        </div>

        {/* Conteúdo da Tab - Enviar Convite */}
        {activeTab === 'send' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coluna da Esquerda - Formulário de Convite */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Novo Convite</h2>
                <form onSubmit={handleInvitationSubmit} className="space-y-6">
                  {/* Email do usuário */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email do Usuário</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="email@exemplo.com"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                
                  {/* Seleção de Empresa */}
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">Empresa</label>
                    <div className="mt-1">
                      <select
                        id="company"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={selectedCompany ? selectedCompany.id : ''}
                        onChange={(e) => {
                          const companyId = parseInt(e.target.value);
                          const company = companies.find(c => c.id === companyId);
                          handleCompanySelect(company);
                        }}
                        required
                      >
                        <option value="">Selecione uma empresa</option>
                        {companies.map(company => (
                          <option key={company.id} value={company.id}>
                            {company.companyName} ({company.companyCode})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                
                  {/* Seleção de Unidades */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unidades (Opcional)</label>
                    <p className="text-xs text-gray-500 mb-2">Selecione uma ou mais unidades para associar ao usuário</p>
                    
                    {selectedCompany ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {filteredUnits.map(unit => (
                          <div 
                            key={unit.id} 
                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                              selectedUnits.some(u => u.id === unit.id) 
                                ? 'bg-blue-50 border-blue-500' 
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => handleUnitSelect(unit)}
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 rounded"
                                checked={selectedUnits.some(u => u.id === unit.id)}
                                onChange={() => {}}
                              />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{unit.unitName}</p>
                                <p className="text-xs text-gray-500">{unit.city} • {unit.unitCode}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-300 border-dashed rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Selecione uma empresa para ver as unidades disponíveis</p>
                      </div>
                    )}
                  </div>
                
                  {/* Seleção de Contrato */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pré-Contrato (Opcional)</label>
                    
                    {selectedCompany ? (
                      filteredContracts.length > 0 ? (
                        <div className="space-y-3 mt-2">
                          {filteredContracts.map(contract => (
                            <div 
                              key={contract.id} 
                              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                selectedContract && selectedContract.id === contract.id
                                  ? 'bg-blue-50 border-blue-500' 
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                              onClick={() => handleContractSelect(contract)}
                            >
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  name="contract"
                                  className="h-4 w-4 text-blue-600"
                                  checked={selectedContract && selectedContract.id === contract.id}
                                  onChange={() => {}}
                                />
                                <div className="ml-3 flex-1">
                                  <div className="flex justify-between">
                                    <p className="text-sm font-medium text-gray-900">{contract.contractId}</p>
                                    <p className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 inline-flex items-center">
                                      {contract.status}
                                    </p>
                                  </div>
                                  <p className="text-xs text-gray-500">{contract.position} • {contract.role}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-300 border-dashed rounded-lg p-4 text-center mt-2">
                          <p className="text-sm text-gray-500">Não há pré-contratos disponíveis para esta empresa</p>
                        </div>
                      )
                    ) : (
                      <div className="bg-gray-50 border border-gray-300 border-dashed rounded-lg p-4 text-center mt-2">
                        <p className="text-sm text-gray-500">Selecione uma empresa para ver os contratos disponíveis</p>
                      </div>
                    )}
                  </div>
                
                  {/* Mensagem personalizada */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensagem de Convite (Opcional)</label>
                    <div className="mt-1">
                      <textarea
                        id="message"
                        rows="3"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Digite uma mensagem personalizada para o destinatário..."
                        value={invitationMessage}
                        onChange={(e) => setInvitationMessage(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                
                  {/* Botões */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => {
                        setSearchEmail('');
                        setSelectedCompany(null);
                        setSelectedUnits([]);
                        setSelectedContract(null);
                        setInvitationMessage('');
                      }}
                    >
                      Limpar
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Convite
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Coluna da Direita - Resumo e Instruções */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Resumo do Convite</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="text-base">{searchEmail || "Não especificado"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Empresa</h3>
                    <p className="text-base">{selectedCompany ? selectedCompany.companyName : "Não selecionada"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Unidades</h3>
                    {selectedUnits.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm">
                        {selectedUnits.map(unit => (
                          <li key={unit.id}>{unit.unitName} ({unit.unitCode})</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-base">Nenhuma selecionada</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Contrato</h3>
                    <p className="text-base">{selectedContract ? `${selectedContract.contractId} - ${selectedContract.position}` : "Não selecionado"}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-blue-900 mb-4">Sobre o Processo de Convite</h2>
                <ul className="space-y-3 text-sm text-blue-800">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    </div>
                    <p className="ml-2">O convite será enviado para o email informado e terá validade de <strong>7 dias</strong>.</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    </div>
                    <p className="ml-2">Ao aceitar o convite, o usuário será associado à empresa selecionada.</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    </div>
                    <p className="ml-2">Se unidades forem selecionadas, o usuário terá acesso a essas unidades específicas.</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    </div>
                    <p className="ml-2">Caso um pré-contrato seja incluído, ele será apresentado ao usuário para aceitação.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo da Tab - Gerenciar Convites */}
        {activeTab === 'manage' && (
          <div className="bg-white rounded-lg shadow-md">
            {/* Barra de Filtros */}
            <div className="px-6 py-4 border-b flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <h2 className="text-lg font-medium text-gray-900">Convites Enviados</h2>
              <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Buscar por e-mail..."
                  />
                </div>
                <select
                  className="block w-full md:w-auto rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Todos os status</option>
                  <option value="pending">Pendentes</option>
                  <option value="accepted">Aceitos</option>
                  <option value="rejected">Recusados</option>
                  <option value="expired">Expirados</option>
                </select>
              </div>
            </div>
            
            {/* Tabela de Convites */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa / Unidades
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contrato
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvitations.length > 0 ? (
                    filteredInvitations.map((invitation) => (
                      <tr key={invitation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-medium">{invitation.name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{invitation.name}</div>
                              <div className="text-sm text-gray-500">{invitation.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{invitation.company.companyName}</div>
                          <div className="text-sm text-gray-500">
                            {invitation.units.length > 0 
                              ? invitation.units.map(u => u.unitName).join(', ')
                              : 'Sem unidades'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {invitation.contract ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">{invitation.contract.contractId}</div>
                              <div className="text-sm text-gray-500">{invitation.contract.position}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Sem contrato</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invitation.status)}`}>
                            <span className="flex items-center">
                              {getStatusIcon(invitation.status)}
                              <span className="ml-1">{getStatusText(invitation.status)}</span>
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invitation.status === 'accepted' && (
                            <span>Aceito em: {formatDate(invitation.acceptedAt)}</span>
                          )}
                          {invitation.status === 'rejected' && (
                            <span>Recusado em: {formatDate(invitation.rejectedAt)}</span>
                          )}
                          {invitation.status === 'pending' && (
                            <span>Expira em: {formatDate(invitation.expiresAt)}</span>
                          )}
                          {invitation.status === 'expired' && (
                            <span>Expirou em: {formatDate(invitation.expiresAt)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewInvitation(invitation)}
                            className="text-blue-600 hover:text-blue-900 mx-2"
                          >
                            Ver
                          </button>
                          {(invitation.status === 'expired' || invitation.status === 'rejected') && (
                            <button
                              onClick={() => handleResendInvitation(invitation)}
                              className="text-green-600 hover:text-green-900 mx-2"
                            >
                              Reenviar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        Nenhum convite encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Modais */}
      {showModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              {modalType === 'success' && (
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Convite Enviado com Sucesso!
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        O convite foi enviado para o e-mail indicado. O usuário receberá as instruções para aceitar o convite.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                      onClick={() => setShowModal(false)}
                    >
                      Entendi
                    </button>
                  </div>
                </div>
              )}
              
              {modalType === 'view' && currentInvitation && (
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Detalhes do Convite
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Informações detalhadas sobre o convite enviado.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={() => setShowModal(false)}
                    >
                      <span className="sr-only">Fechar</span>
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="mt-5 border-t border-gray-200 pt-4">
                    <dl className="divide-y divide-gray-200">
                      <div className="py-3 flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="text-sm text-right">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(currentInvitation.status)}`}>
                            <span className="flex items-center">
                              {getStatusIcon(currentInvitation.status)}
                              <span className="ml-1">{getStatusText(currentInvitation.status)}</span>
                            </span>
                          </span>
                        </dd>
                      </div>
                      <div className="py-3 flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Enviado para</dt>
                        <dd className="text-sm text-gray-900 text-right">
                          <div>{currentInvitation.name}</div>
                          <div className="text-gray-500">{currentInvitation.email}</div>
                        </dd>
                      </div>
                      <div className="py-3 flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Empresa</dt>
                        <dd className="text-sm text-gray-900 text-right">{currentInvitation.company.companyName}</dd>
                      </div>
                      <div className="py-3 flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Unidades</dt>
                        <dd className="text-sm text-gray-900 text-right">
                          {currentInvitation.units.length > 0 ? (
                            <ul className="list-none">
                              {currentInvitation.units.map(unit => (
                                <li key={unit.id}>{unit.unitName} ({unit.unitCode})</li>
                              ))}
                            </ul>
                          ) : (
                            "Sem unidades"
                          )}
                        </dd>
                      </div>
                      <div className="py-3 flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Contrato</dt>
                        <dd className="text-sm text-gray-900 text-right">
                          {currentInvitation.contract ? (
                            <div>
                              <div>{currentInvitation.contract.contractId}</div>
                              <div className="text-gray-500">{currentInvitation.contract.position}</div>
                            </div>
                          ) : (
                            "Sem contrato"
                          )}
                        </dd>
                      </div>
                      <div className="py-3 flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Data de Envio</dt>
                        <dd className="text-sm text-gray-900 text-right">{formatDate(currentInvitation.createdAt)}</dd>
                      </div>
                      {currentInvitation.status === 'pending' && (
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Expira em</dt>
                          <dd className="text-sm text-gray-900 text-right">{formatDate(currentInvitation.expiresAt)}</dd>
                        </div>
                      )}
                      {currentInvitation.status === 'accepted' && (
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Aceito em</dt>
                          <dd className="text-sm text-gray-900 text-right">{formatDate(currentInvitation.acceptedAt)}</dd>
                        </div>
                      )}
                      {currentInvitation.status === 'rejected' && (
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Recusado em</dt>
                          <dd className="text-sm text-gray-900 text-right">{formatDate(currentInvitation.rejectedAt)}</dd>
                        </div>
                      )}
                      <div className="py-3">
                        <dt className="text-sm font-medium text-gray-500 mb-2">Mensagem</dt>
                        <dd className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                          {currentInvitation.message}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 flex justify-between">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                      onClick={() => setShowModal(false)}
                    >
                      Fechar
                    </button>
                    
                    {(currentInvitation.status === 'expired' || currentInvitation.status === 'rejected') && (
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                        onClick={() => {
                          handleResendInvitation(currentInvitation);
                          setShowModal(false);
                          setTimeout(() => {
                            setModalType('resent');
                            setShowModal(true);
                          }, 300);
                        }}
                      >
                        Reenviar Convite
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {modalType === 'resent' && (
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Convite Reenviado!
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        O convite foi reenviado com sucesso. O usuário terá mais 7 dias para aceitar o convite.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                      onClick={() => setShowModal(false)}
                    >
                      Entendi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Adicione este componente para visualizar como seria para o usuário receber o convite */}
      {false && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Convite para Plateiapositiva, Lda
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Você foi convidado a se juntar à Plateiapositiva, Lda. Revise os detalhes abaixo e aceite o convite para fazer parte da equipe.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <p className="text-sm text-gray-700 italic">
                      "Olá Maria, gostaríamos de convidá-la para fazer parte da nossa equipe."
                    </p>
                  </div>
                  
                  <dl className="divide-y divide-gray-200">
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Empresa</dt>
                      <dd className="text-sm text-gray-900">Plateiapositiva, Lda (PLT)</dd>
                    </div>
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Unidades</dt>
                      <dd className="text-sm text-gray-900">Matosinhos (MAT)</dd>
                    </div>
                    <div className="py-3">
                      <dt className="text-sm font-medium text-gray-500 mb-2">Pré-Contrato</dt>
                      <dd className="bg-white border border-gray-200 rounded-md p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-900">CONT-2025-001</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">Pré-Contrato</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Posição:</p>
                            <p className="font-medium">Barista</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Função:</p>
                            <p className="font-medium">Atendente</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Tipo:</p>
                            <p className="font-medium">Tempo Integral</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Horas Semanais:</p>
                            <p className="font-medium">40h</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Início:</p>
                            <p className="font-medium">01/04/2025</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Término:</p>
                            <p className="font-medium">31/03/2026</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-blue-600 hover:underline cursor-pointer">Ver contrato completo</span>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                  Aceitar Convite
                </button>
                <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Recusar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInvitationSystem;