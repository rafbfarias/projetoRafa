'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MapLayerMouseEvent, ViewState } from 'react-map-gl';
import Map, { Marker, Popup } from 'react-map-gl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin, Users } from 'lucide-react';
import type { Timesheet } from '@/types/timesheet';
import { timesheetService } from '@/services/timesheetService';
import { toast } from '@/components/ui/use-toast';
import { DashboardView } from '@/components/layouts/DashboardView';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Tipo para o estado da visualização do mapa
interface MapViewState extends Partial<ViewState> {
  latitude: number;
  longitude: number;
  zoom: number;
}

export default function TimesheetDashboard() {
  const [viewState, setViewState] = useState<MapViewState>({
    latitude: 38.7223, // Centro de Portugal
    longitude: -9.1393,
    zoom: 9
  });
  const [records, setRecords] = useState<Timesheet[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Timesheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isListView, setIsListView] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await timesheetService.getActiveRecords();
      setRecords(response.data);
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar registros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.employeeName.toLowerCase().includes(searchLower) ||
      record.currentTask?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <DashboardView
      title="Timesheet"
      searchProps={{
        value: searchTerm,
        onChange: setSearchTerm,
        placeholder: "Pesquisar por funcionário ou tarefa..."
      }}
      viewOptions={{
        isListView,
        onViewChange: setIsListView
      }}
      actions={
        <Button onClick={() => router.push('/dashboard/timesheet/new')}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Novo Registro
        </Button>
      }
      headerCard={{
        title: "Controle de Ponto",
        description: "Monitore a localização e atividades dos funcionários",
        stats: [
          { label: "Ativos", value: `${records.filter(r => r.status === 'active').length} Funcionários` },
          { label: "Total", value: `${records.length} Registros` }
        ]
      }}
      isLoading={loading}
      emptyState={
        records.length === 0 ? {
          icon: <Users className="w-12 h-12 mx-auto text-zinc-400" />,
          title: "Nenhum registro encontrado",
          description: "Comece registrando seu primeiro ponto",
          action: (
            <Button 
              onClick={() => router.push('/dashboard/timesheet/new')}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Registrar Primeiro Ponto
            </Button>
          )
        } : undefined
      }
    >
      {/* Mapa sempre visível */}
      <Card className="bg-zinc-800 border-zinc-700 mb-6">
        <CardContent className="p-0">
          <div className="h-[400px] w-full rounded-lg overflow-hidden">
            <Map
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            >
              {records.map((record) => (
                <Marker
                  key={record._id}
                  latitude={record.location.lat}
                  longitude={record.location.lng}
                  onClick={() => setSelectedRecord(record)}
                >
                  <MapPin className="w-6 h-6 text-orange-500 cursor-pointer" />
                </Marker>
              ))}
              {selectedRecord && (
                <Popup
                  latitude={selectedRecord.location.lat}
                  longitude={selectedRecord.location.lng}
                  onClose={() => setSelectedRecord(null)}
                  closeButton={true}
                  closeOnClick={false}
                  className="bg-zinc-800 border-none text-white"
                >
                  <div className="p-2">
                    <h3 className="font-bold">{selectedRecord.employeeName}</h3>
                    <p className="text-sm text-zinc-400">{selectedRecord.currentTask}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(selectedRecord.checkInTime).toLocaleTimeString()}
                    </p>
                  </div>
                </Popup>
              )}
            </Map>
          </div>
        </CardContent>
      </Card>

      {/* Visualização condicional: Lista ou Cards */}
      {isListView ? (
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle>Registros Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">Funcionário</th>
                    <th className="p-2">Check-in</th>
                    <th className="p-2">Localização</th>
                    <th className="p-2">Tarefa Atual</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map(record => (
                    <tr 
                      key={record._id}
                      className="hover:bg-zinc-700/50 transition-colors duration-200 cursor-pointer border-b border-zinc-700/50"
                      onClick={() => router.push(`/dashboard/timesheet/${record._id}`)}
                    >
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={record.employeeImage} />
                            <AvatarFallback>{record.employeeName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {record.employeeName}
                        </div>
                      </td>
                      <td className="p-2">
                        {new Date(record.checkInTime).toLocaleTimeString()}
                      </td>
                      <td className="p-2">
                        {record.location.lat.toFixed(4)}, {record.location.lng.toFixed(4)}
                      </td>
                      <td className="p-2">{record.currentTask || '-'}</td>
                      <td className="p-2">
                        <Badge variant={record.status === 'active' ? "default" : "secondary"}>
                          {record.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecords.map((record) => (
            <Card 
              key={record._id}
              className="hover:bg-zinc-800 transition-colors cursor-pointer"
              onClick={() => router.push(`/dashboard/timesheet/${record._id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={record.employeeImage} />
                      <AvatarFallback>{record.employeeName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{record.employeeName}</CardTitle>
                      <p className="text-sm text-zinc-400">{record.currentTask || 'Sem tarefa'}</p>
                    </div>
                  </div>
                  <Badge variant={record.status === 'active' ? "default" : "secondary"}>
                    {record.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-zinc-400">Localização</p>
                    <p className="font-medium">
                      {record.location.lat.toFixed(4)}, {record.location.lng.toFixed(4)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
                    <span className="text-sm text-zinc-400">Check-in</span>
                    <span className="font-medium">
                      {new Date(record.checkInTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Card para Adicionar Novo Registro */}
          <Card 
            className="border-2 border-dashed border-zinc-700 hover:border-orange-500 transition-colors cursor-pointer bg-transparent"
            onClick={() => router.push('/dashboard/timesheet/new')}
          >
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-zinc-400 hover:text-orange-500">
              <PlusCircle className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">Adicionar Novo Registro</p>
              <p className="text-sm opacity-70">Registre pontos e atividades</p>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardView>
  );
} 