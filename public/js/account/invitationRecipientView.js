import React, { useState } from 'react';
import { 
  Building, 
  FileText, 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Lock, 
  MapPin, 
  Phone, 
  Users, 
  Briefcase
} from 'lucide-react';

const InvitationRecipientView = () => {
  const [step, setStep] = useState('review');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    zipCode: '',
    city: '',
    country: 'Portugal',
    acceptTerms: false
  });
  
  const invitation = {
    id: 1,
    company: {
      id: 1, 
      companyName: 'Plateiapositiva, Lda', 
      companyCode: 'PLT', 
      companyVATNumber: '123456789'
    },
    units: [
      { id: 1, unitName: 'Matosinhos', unitCode: 'MAT', city: 'Matosinhos', seatingCapacity: 80 }
    ],
    contract: {
      id: 1, 
      contractId: 'CONT-2025-001', 
      company: 'Plateiapositiva, Lda', 
      position: 'Barista', 
      role: 'Atendente', 
      contractType: 'Tempo Integral', 
      hoursPerWeek: 40, 
      startDate: '2025-04-01', 
      endDate: '2026-03-31', 
      status: 'Pré-Contrato',
      baseSalary: 800,
      mealAllowance: 7.50
    },
    email: 'maria.silva@example.com',
    status: 'pending',
    createdAt: '2025-03-01T10:00:00.000Z',
    expiresAt: '2025-03-08T10:00:00.000Z',
    message: 'Olá Maria, gostaríamos de convidá-la para fazer parte da nossa equipe.'
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleRejectInvitation = () => {
    if (window.confirm('Tem certeza que deseja recusar este convite? Esta ação não pode ser desfeita.')) {
      setStep('rejected');
    }
  };
  
  const handleAcceptInvitation = () => {
    if (!formData.acceptTerms) {
      alert('Você precisa aceitar os termos para continuar.');
      return;
    }
    setStep('complete');
  };
  
  const isFormComplete = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.address.trim() !== '' &&
      formData.zipCode.trim() !== '' &&
      formData.city.trim() !== '' &&
      formData.acceptTerms
    );
  };
  
  // Formatar data
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Sistema de Convites</h1>
          <p className="mt-2 text-lg text-gray-600">Gerenciamento de associações entre usuários, empresas e unidades</p>
        </div>

        {step === 'review' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Convite para {invitation.company.companyName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Este convite expira em {formatDate(invitation.expiresAt)}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-200 pt-5">
                {invitation.message && (
                  <div className="bg-blue-50 p-4 rounded-md mb-6">
                    <p className="text-sm text-blue-700 italic">
                      "{invitation.message}"
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Informações da Empresa */}
                  <div className="col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm p-5">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Building className="h-5 w-5 text-blue-600 mr-2" />
                      Empresa
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Nome da Empresa</p>
                        <p className="text-sm font-medium">{invitation.company.companyName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Código</p>
                        <p className="text-sm font-medium">{invitation.company.companyCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">CNPJ/VAT</p>
                        <p className="text-sm font-medium">{invitation.company.companyVATNumber}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Informações das Unidades */}
                  <div className="col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm p-5">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                      Unidades
                    </h4>
                    {invitation.units.length > 0 ? (
                      <div className="space-y-4">
                        {invitation.units.map(unit => (
                          <div key={unit.id} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                            <p className="text-sm font-medium">{unit.unitName} ({unit.unitCode})</p>
                            <p className="text-xs text-gray-500">{unit.city}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhuma unidade associada a este convite.</p>
                    )}
                  </div>
                  
                  {/* Informações do E-mail */}
                  <div className="col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm p-5">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-2" />
                      Informações do Convite
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm font-medium">{invitation.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Data de Criação</p>
                        <p className="text-sm font-medium">{formatDate(invitation.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Data de Expiração</p>
                        <p className="text-sm font-medium">{formatDate(invitation.expiresAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Informações do Contrato */}
                {invitation.contract && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                      Pré-Contrato
                    </h4>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-md font-medium text-gray-900">{invitation.contract.contractId}</h5>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          {invitation.contract.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Posição</p>
                          <p className="text-sm font-medium">{invitation.contract.position}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Função</p>
                          <p className="text-sm font-medium">{invitation.contract.role}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tipo de Contrato</p>
                          <p className="text-sm font-medium">{invitation.contract.contractType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Carga Horária</p>
                          <p className="text-sm font-medium">{invitation.contract.hoursPerWeek} horas/semana</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Data de Início</p>
                          <p className="text-sm font-medium">{formatDate(invitation.contract.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Data de Término</p>
                          <p className="text-sm font-medium">{formatDate(invitation.contract.endDate)}</p>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4 mt-2">
                        <h6 className="text-sm font-medium text-gray-900 mb-3">Compensação</h6>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Salário Base</p>
                            <p className="text-sm font-medium">{invitation.contract.baseSalary.toLocaleString('pt-BR', { style: 'currency', currency: 'EUR' })}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Vale Refeição</p>
                            <p className="text-sm font-medium">{invitation.contract.mealAllowance.toLocaleString('pt-BR', { style: 'currency', currency: 'EUR' })} / dia</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center">
                        <FileText className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">Ver contrato completo</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Formulário para informações adicionais */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 text-blue-600 mr-2" />
                    Complete suas informações
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nome</label>
                      <input 
                        type="text" 
                        id="firstName" 
                        name="firstName" 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Sobrenome</label>
                      <input 
                        type="text" 
                        id="lastName" 
                        name="lastName" 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">Endereço</label>
                      <input 
                        type="text" 
                        id="address" 
                        name="address" 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">CEP/Código Postal</label>
                      <input 
                        type="text" 
                        id="zipCode" 
                        name="zipCode" 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">Cidade</label>
                      <input 
                        type="text" 
                        id="city" 
                        name="city" 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">País</label>
                      <select 
                        id="country" 
                        name="country" 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Portugal">Portugal</option>
                        <option value="Brasil">Brasil</option>
                        <option value="Espanha">Espanha</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="acceptTerms"
                          name="acceptTerms"
                          type="checkbox"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={formData.acceptTerms}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="acceptTerms" className="font-medium text-gray-700">Aceito os termos e condições</label>
                        <p className="text-gray-500">Ao aceitar, você concorda com os termos de uso e com o compartilhamento de seus dados com a empresa convidante.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Botões de Ação */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={handleRejectInvitation}
                  >
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                    Recusar Convite
                  </button>
                  <button
                    type="button"
                    className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isFormComplete() ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' : 'bg-blue-400 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2`}
                    onClick={handleAcceptInvitation}
                    disabled={!isFormComplete()}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Aceitar Convite
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {step === 'rejected' && (
          <div className="bg-white shadow sm:rounded-lg p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Convite Recusado</h3>
            <p className="mt-2 text-sm text-gray-500">
              Você recusou o convite para se juntar à {invitation.company.companyName}.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => window.location.href = '/'}
              >
                Voltar para a página inicial
              </button>
            </div>
          </div>
        )}
        
        {step === 'complete' && (
          <div className="bg-white shadow sm:rounded-lg p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Convite Aceito!</h3>
            <p className="mt-2 text-sm text-gray-500">
              Parabéns! Você aceitou o convite para se juntar à {invitation.company.companyName}.
            </p>
            <div className="mt-4 bg-blue-50 p-4 rounded-md text-sm text-blue-700">
              Um e-mail de confirmação foi enviado para {invitation.email} com os próximos passos.
            </div>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => window.location.href = '/dashboard'}
              >
                Acessar o sistema
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationRecipientView;