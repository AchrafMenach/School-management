import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Users, Clock, BookOpen, DollarSign, 
  Check, X, Download, Upload, Eye, EyeOff, GraduationCap,
  TrendingUp, Calendar, AlertCircle, CheckCircle, XCircle, Phone,
  Mail, MapPin, Star, Award, Activity, BarChart3, PieChart,
  FileText, Settings, Bell, RefreshCw, ChevronLeft, ChevronRight,
  Database, Save, Loader
} from 'lucide-react';

// Système de stockage local amélioré
const StorageManager = {
  // Clés de stockage
  STUDENTS_KEY: 'school_management_students',
  PAYMENTS_KEY: 'school_management_payments',
  
  // Sauvegarder les étudiants
  saveStudents: (students) => {
    try {
      const data = {
        students: students,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };
      
      // Méthode 1: localStorage (recommandée pour cette application)
      localStorage.setItem(StorageManager.STUDENTS_KEY, JSON.stringify(data));
      
      // Méthode 2: Alternative avec sessionStorage (données perdues à la fermeture)
      // sessionStorage.setItem(StorageManager.STUDENTS_KEY, JSON.stringify(data));
      
      console.log('✅ Étudiants sauvegardés avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des étudiants:', error);
      return false;
    }
  },
  
  // Charger les étudiants
  loadStudents: () => {
    try {
      const savedData = localStorage.getItem(StorageManager.STUDENTS_KEY);
      if (savedData) {
        const data = JSON.parse(savedData);
        console.log('✅ Étudiants chargés depuis le stockage local');
        return data.students || [];
      }
      console.log('ℹ️ Aucune donnée d\'étudiants trouvée, utilisation des données par défaut');
      return StorageManager.getDefaultStudents();
    } catch (error) {
      console.error('❌ Erreur lors du chargement des étudiants:', error);
      return StorageManager.getDefaultStudents();
    }
  },
  
  // Sauvegarder les paiements
  savePayments: (payments) => {
    try {
      const data = {
        payments: payments,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem(StorageManager.PAYMENTS_KEY, JSON.stringify(data));
      console.log('✅ Paiements sauvegardés avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des paiements:', error);
      return false;
    }
  },
  
  // Charger les paiements
  loadPayments: () => {
    try {
      const savedData = localStorage.getItem(StorageManager.PAYMENTS_KEY);
      if (savedData) {
        const data = JSON.parse(savedData);
        console.log('✅ Paiements chargés depuis le stockage local');
        return data.payments || {};
      }
      console.log('ℹ️ Aucune donnée de paiements trouvée, utilisation des données par défaut');
      return StorageManager.getDefaultPayments();
    } catch (error) {
      console.error('❌ Erreur lors du chargement des paiements:', error);
      return StorageManager.getDefaultPayments();
    }
  },
  
  // Données par défaut pour les étudiants (liste vide)
  getDefaultStudents: () => [],
  
  // Données par défaut pour les paiements (objet vide)
  getDefaultPayments: () => ({}),
  
  // Exporter toutes les données
  exportAllData: () => {
    try {
      const students = StorageManager.loadStudents();
      const payments = StorageManager.loadPayments();
      
      const exportData = {
        students,
        payments,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ Erreur lors de l\'exportation:', error);
      return null;
    }
  },
  
  // Importer toutes les données
  importAllData: (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.students) {
        StorageManager.saveStudents(data.students);
      }
      if (data.payments) {
        StorageManager.savePayments(data.payments);
      }
      
      console.log('✅ Données importées avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'importation:', error);
      return false;
    }
  },
  
  // Effacer toutes les données
  clearAllData: () => {
    try {
      localStorage.removeItem(StorageManager.STUDENTS_KEY);
      localStorage.removeItem(StorageManager.PAYMENTS_KEY);
      console.log('✅ Toutes les données ont été effacées');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'effacement des données:', error);
      return false;
    }
  }
};

const SchoolManagementApp = () => {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const [showStats, setShowStats] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    level: '',
    subscriptionMonth: '',
    price: '',
    notes: ''
  });

  const levels = [
    'CP', 'CE1', 'CE2', 'CM1', 'CM2',
    '6ème', '5ème', '4ème', '3ème',
    '2nde', '1ère', 'Terminale',
    'Sup', 'Spé', 'Licence', 'Master'
  ];

  // Chargement initial des données
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Simuler un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const loadedStudents = StorageManager.loadStudents();
        const loadedPayments = StorageManager.loadPayments();
        
        setStudents(loadedStudents);
        setPayments(loadedPayments);
        setError(null);
      } catch (error) {
        setError('Erreur lors du chargement des données');
        console.error('Erreur de chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Sauvegarde automatique des étudiants
  useEffect(() => {
    if (students.length > 0 && !loading) {
      const saveData = async () => {
        setSaving(true);
        const success = StorageManager.saveStudents(students);
        if (success) {
          setLastSaved(new Date());
        }
        setSaving(false);
      };

      // Débounce la sauvegarde pour éviter trop d'appels
      const timeoutId = setTimeout(saveData, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [students, loading]);

  // Sauvegarde automatique des paiements
  useEffect(() => {
    if (Object.keys(payments).length > 0 && !loading) {
      const saveData = async () => {
        setSaving(true);
        const success = StorageManager.savePayments(payments);
        if (success) {
          setLastSaved(new Date());
        }
        setSaving(false);
      };

      const timeoutId = setTimeout(saveData, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [payments, loading]);

  const getMonthName = (monthString) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const [year, month] = monthString.split('-');
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const getShortMonthName = (monthString) => {
    const months = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    const [year, month] = monthString.split('-');
    return `${months[parseInt(month) - 1]} ${year.slice(-2)}`;
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.level || !formData.subscriptionMonth) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setSaving(true);
    
    try {
      let updatedStudents;
      
      if (editingStudent) {
        // Modification d'un étudiant existant
        updatedStudents = students.map(student => 
          student.id === editingStudent.id 
            ? { ...formData, id: editingStudent.id, registrationDate: editingStudent.registrationDate }
            : student
        );
      } else {
        // Ajout d'un nouvel étudiant
        const newStudent = {
          ...formData,
          id: Date.now(), // Utilisation d'un timestamp comme ID unique
          registrationDate: new Date().toISOString().split('T')[0]
        };
        updatedStudents = [...students, newStudent];
      }
      
      setStudents(updatedStudents);
      
      // Notification de succès
      const action = editingStudent ? 'modifié' : 'ajouté';
      setNotifications([{
        id: Date.now(),
        message: `Étudiant ${formData.firstName} ${formData.lastName} ${action} avec succès !`,
        type: 'success'
      }]);
      
      resetForm();
      setShowForm(false);
      setEditingStudent(null);
      
    } catch (error) {
      setError(`Erreur lors de la sauvegarde: ${error.message}`);
      setNotifications([{
        id: Date.now(),
        message: 'Erreur lors de la sauvegarde de l\'étudiant',
        type: 'error'
      }]);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birthDate: '',
      level: '',
      subscriptionMonth: '',
      price: '',
      notes: ''
    });
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData(student);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible.')) {
      setSaving(true);
      
      try {
        const updatedStudents = students.filter(student => student.id !== id);
        setStudents(updatedStudents);
        
        // Supprimer aussi les paiements associés
        const newPayments = { ...payments };
        Object.keys(newPayments).forEach(key => {
          if (key.startsWith(`${id}_`)) {
            delete newPayments[key];
          }
        });
        setPayments(newPayments);
        
        setNotifications([{
          id: Date.now(),
          message: 'Étudiant supprimé avec succès',
          type: 'success'
        }]);
        
      } catch (error) {
        setError(`Erreur lors de la suppression: ${error.message}`);
      } finally {
        setSaving(false);
      }
    }
  };

  const togglePayment = async (studentId, month) => {
    setSaving(true);
    
    try {
      const key = `${studentId}_${month}`;
      const newPayments = {
        ...payments,
        [key]: !payments[key]
      };
      setPayments(newPayments);
      
      setNotifications([{
        id: Date.now(),
        message: `Paiement ${newPayments[key] ? 'marqué comme payé' : 'marqué comme non payé'}`,
        type: 'success'
      }]);
      
    } catch (error) {
      setError(`Erreur lors de la mise à jour du paiement: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getPaymentStatus = (studentId, month) => {
    return payments[`${studentId}_${month}`] || false;
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingStudent(null);
    resetForm();
  };

  // Fonction pour obtenir tous les mois d'abonnement d'un étudiant
  const getMonthsForStudent = (subscriptionMonth) => {
    if (!subscriptionMonth) return [];
    
    const months = [];
    const now = new Date();
    
    const [startYear, startMonth] = subscriptionMonth.split('-').map(Number);
    
    let current = new Date(startYear, startMonth - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    
    while (current <= endDate) {
      const monthString = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      months.push(monthString);
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  };

  const getDisplayedMonths = () => {
    const now = new Date();
    const months = [];
    
    for (let i = -3; i <= 2; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push(monthString);
    }
    
    return months;
  };

  const displayedMonths = getDisplayedMonths();

  const getMonthStatus = (month) => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [year, monthNum] = month.split('-').map(Number);
    const monthDate = new Date(year, monthNum - 1);
    const currentDate = new Date(now.getFullYear(), now.getMonth());
    
    if (monthDate < currentDate) return 'past';
    if (month === currentMonth) return 'current';
    return 'future';
  };

  // Fonctions d'exportation et d'importation
  const exportData = () => {
    try {
      const exportData = StorageManager.exportAllData();
      if (exportData) {
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ecole_donnees_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setNotifications([{
          id: Date.now(),
          message: 'Données exportées avec succès !',
          type: 'success'
        }]);
      }
    } catch (error) {
      setError('Erreur lors de l\'exportation des données');
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const success = StorageManager.importAllData(e.target.result);
          if (success) {
            // Recharger les données
            setStudents(StorageManager.loadStudents());
            setPayments(StorageManager.loadPayments());
            
            setNotifications([{
              id: Date.now(),
              message: 'Données importées avec succès !',
              type: 'success'
            }]);
          }
        } catch (error) {
          setError('Erreur lors de l\'importation des données');
        }
      };
      reader.readAsText(file);
    }
  };

  // Statistiques calculées
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active' || !s.status).length;
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    
    const studentsWithCurrentMonth = students.filter(student => {
      const studentMonths = getMonthsForStudent(student.subscriptionMonth);
      return studentMonths.includes(currentMonth);
    });
    
    const paidThisMonth = studentsWithCurrentMonth.filter(s => getPaymentStatus(s.id, currentMonth)).length;
    const unpaidThisMonth = studentsWithCurrentMonth.length - paidThisMonth;
    
    const levelDistribution = levels.reduce((acc, level) => {
      acc[level] = students.filter(s => s.level === level).length;
      return acc;
    }, {});

    const totalRevenue = studentsWithCurrentMonth.reduce((total, student) => {
      if (getPaymentStatus(student.id, currentMonth) && student.price) {
        return total + parseFloat(student.price || 0);
      }
      return total;
    }, 0);

    let paymentsOverdue = 0;
    students.forEach(student => {
      const studentMonths = getMonthsForStudent(student.subscriptionMonth);
      studentMonths.forEach(month => {
        const status = getMonthStatus(month);
        if (status === 'past' && !getPaymentStatus(student.id, month)) {
          paymentsOverdue++;
        }
      });
    });

    return {
      totalStudents,
      activeStudents,
      paidThisMonth,
      unpaidThisMonth,
      levelDistribution,
      totalRevenue,
      paymentRate: studentsWithCurrentMonth.length > 0 ? Math.round((paidThisMonth / studentsWithCurrentMonth.length) * 100) : 0,
      paymentsOverdue,
      studentsWithCurrentMonth: studentsWithCurrentMonth.length
    };
  }, [students, payments]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('border-l-', 'bg-')}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );

  const NotificationBell = () => (
    <div className="relative">
      <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
        <Bell className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
    </div>
  );

  // Notifications automatiques
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  // Affichage du loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-4">
            <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Chargement des données...</h2>
              <p className="text-gray-600">Récupération depuis le stockage local</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg shadow-lg ${
                  notification.type === 'success' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                } animate-slide-in`}
              >
                <div className="flex items-center space-x-2">
                  {notification.type === 'success' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span>{notification.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  EduManage Pro
                </h1>
                <p className="text-gray-600">
                  Système complet de gestion scolaire
                  {lastSaved && (
                    <span className="text-green-600 ml-2">
                      • Dernière sauvegarde: {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {saving && (
                <div className="flex items-center space-x-2 text-indigo-600">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Sauvegarde...</span>
                </div>
              )}
              
              <NotificationBell />
              
              <button
                onClick={() => setShowStats(!showStats)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                title="Afficher/Masquer les statistiques"
              >
                <BarChart3 className="h-6 w-6" />
              </button>
              
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-indigo-600" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">{stats.totalStudents}</div>
                  <div className="text-sm text-gray-500">Étudiants total</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets de navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'students'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="inline h-4 w-4 mr-2" />
              Étudiants
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'payments'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <DollarSign className="inline h-4 w-4 mr-2" />
              Paiements
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="inline h-4 w-4 mr-2" />
              Analyses
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'data'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Database className="inline h-4 w-4 mr-2" />
              Gestion des données
            </button>
          </div>
        </div>

        {/* Statistiques */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Étudiants Actifs"
              value={stats.activeStudents}
              icon={Users}
              color="border-l-blue-500"
              subtitle="Total inscrits"
            />
            <StatCard
              title="Payé ce mois"
              value={stats.paidThisMonth}
              icon={CheckCircle}
              color="border-l-green-500"
              subtitle={`${stats.paymentRate}% de taux`}
            />
            <StatCard
              title="En attente"
              value={stats.unpaidThisMonth}
              icon={AlertCircle}
              color="border-l-orange-500"
              subtitle="Ce mois-ci"
            />
            <StatCard
              title="En retard"
              value={stats.paymentsOverdue}
              icon={XCircle}
              color="border-l-red-500"
              subtitle="Mois passés"
            />
          </div>
        )}

        {/* Onglet Gestion des données */}
        {activeTab === 'data' && (
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Gestion des Données</h2>
              <p className="text-sm text-gray-600 mt-1">
                Exportez, importez ou sauvegardez vos données
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Statut du stockage */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Database className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Stockage Local</h3>
                      <p className="text-sm text-gray-600">Données sauvegardées automatiquement</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Étudiants:</span>
                      <span className="text-sm font-medium text-green-600">{students.length} enregistrés</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Paiements:</span>
                      <span className="text-sm font-medium text-green-600">{Object.keys(payments).length} entrées</span>
                    </div>
                    {lastSaved && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Dernière sauvegarde:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {lastSaved.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Exportation */}
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Download className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Exportation</h3>
                      <p className="text-sm text-gray-600">Télécharger toutes vos données</p>
                    </div>
                  </div>
                  <button
                    onClick={exportData}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Exporter en JSON
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Télécharge un fichier JSON avec tous les étudiants et paiements
                  </p>
                </div>

                {/* Importation */}
                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Upload className="h-8 w-8 text-orange-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Importation</h3>
                      <p className="text-sm text-gray-600">Restaurer depuis un fichier</p>
                    </div>
                  </div>
                  <label className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors cursor-pointer block text-center">
                    Choisir un fichier
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Importe un fichier JSON exporté précédemment
                  </p>
                </div>
              </div>

              {/* Actions supplémentaires */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Avancées</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setSaving(true);
                      StorageManager.saveStudents(students);
                      StorageManager.savePayments(payments);
                      setLastSaved(new Date());
                      setSaving(false);
                      setNotifications([{
                        id: Date.now(),
                        message: 'Sauvegarde manuelle effectuée avec succès !',
                        type: 'success'
                      }]);
                    }}
                    disabled={saving}
                    className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>Sauvegarde Manuelle</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Êtes-vous sûr de vouloir effacer TOUTES les données ? Cette action est irréversible !')) {
                        StorageManager.clearAllData();
                        setStudents(StorageManager.getDefaultStudents());
                        setPayments(StorageManager.getDefaultPayments());
                        setNotifications([{
                          id: Date.now(),
                          message: 'Toutes les données ont été effacées et réinitialisées',
                          type: 'success'
                        }]);
                      }
                    }}
                    className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Réinitialiser</span>
                  </button>
                </div>
              </div>

              {/* Informations techniques */}
              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Techniques</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Stockage:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Utilise localStorage du navigateur</li>
                      <li>• Sauvegarde automatique à chaque modification</li>
                      <li>• Données persistantes entre les sessions</li>
                      <li>• Pas de serveur requis</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Fonctionnalités:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Export/Import au format JSON</li>
                      <li>• Gestion des étudiants et paiements</li>
                      <li>• Interface responsive</li>
                      <li>• Notifications en temps réel</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Étudiants */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Gestion des Étudiants
                  </h2>
                  <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {filteredStudents.length} étudiant{filteredStudents.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Rechercher un étudiant..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={exportData}
                    className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </button>
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun étudiant</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Aucun étudiant ne correspond à votre recherche.' : 'Commencez par ajouter un nouvel étudiant.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {student.firstName} {student.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{student.level}</p>
                          {student.email && (
                            <p className="text-sm text-gray-500 mt-1 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {student.email}
                            </p>
                          )}
                          {student.phone && (
                            <p className="text-sm text-gray-500 mt-1 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {student.phone}
                            </p>
                          )}
                          <div className="mt-3 flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                              Depuis: {getMonthName(student.subscriptionMonth)}
                            </span>
                            {student.price && (
                              <span className="text-sm font-medium text-green-600">
                                {student.price}€/mois
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Onglet Paiements */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Suivi des Paiements</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Mois actuel : {getMonthName(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Affichage sur 6 mois : {displayedMonths.length > 0 && 
                      `${getShortMonthName(displayedMonths[0])} - ${getShortMonthName(displayedMonths[displayedMonths.length - 1])}`}
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Mois actuel</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Payé</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">En retard</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {students.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun étudiant</h3>
                  <p className="mt-1 text-sm text-gray-500">Ajoutez des étudiants pour voir les paiements.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          <strong>Instructions :</strong> Cliquez sur les boutons pour marquer les paiements reçus. 
                          <span className="inline-flex items-center mx-2">
                            <X className="h-4 w-4 text-red-500 mr-1" />
                            = Non payé
                          </span>
                          <span className="inline-flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-1" />
                            = Payé
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-900 sticky left-0 bg-white shadow-sm z-10">
                            Étudiant
                          </th>
                          {displayedMonths.map((month) => {
                            const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
                            const isCurrentMonth = month === currentMonth;
                            
                            return (
                              <th key={month} className={`text-center py-4 px-4 font-semibold min-w-[120px] ${
                                isCurrentMonth 
                                  ? 'text-white bg-indigo-600' 
                                  : 'text-gray-900'
                              }`}>
                                <div className="flex flex-col items-center">
                                  {isCurrentMonth && (
                                    <div className="flex items-center space-x-2 mb-1">
                                      <Calendar className="h-4 w-4" />
                                      <span className="text-sm font-bold">MOIS ACTUEL</span>
                                    </div>
                                  )}
                                  <span className={`text-sm font-semibold ${isCurrentMonth ? 'text-white' : ''}`}>
                                    {getShortMonthName(month)}
                                  </span>
                                  {!isCurrentMonth && (
                                    <span className={`text-xs px-2 py-1 rounded-full mt-1 ${
                                      getMonthStatus(month) === 'past' 
                                        ? 'bg-gray-100 text-gray-600' 
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {getMonthStatus(month) === 'past' ? 'Passé' : 'Futur'}
                                    </span>
                                  )}
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => {
                          const studentMonths = getMonthsForStudent(student.subscriptionMonth);
                          const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
                          
                          return (
                            <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4 sticky left-0 bg-white shadow-sm z-10">
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {student.firstName} {student.lastName}
                                  </div>
                                  <div className="text-sm text-gray-600">{student.level}</div>
                                  {student.price && (
                                    <div className="text-sm text-green-600 font-medium">
                                      {student.price}€/mois
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-500">
                                    Depuis: {getShortMonthName(student.subscriptionMonth)}
                                  </div>
                                </div>
                              </td>
                              
                              {displayedMonths.map((month) => {
                                const isStudentMonth = studentMonths.includes(month);
                                const isPaid = getPaymentStatus(student.id, month);
                                const monthStatus = getMonthStatus(month);
                                const isCurrentMonth = month === currentMonth;
                                
                                if (!isStudentMonth) {
                                  return (
                                    <td key={month} className={`py-4 px-4 text-center ${
                                      isCurrentMonth ? 'bg-indigo-50 border-l-2 border-indigo-200' : ''
                                    }`}>
                                      <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                          <span className="text-gray-300 text-sm">N/A</span>
                                        </div>
                                        <span className="text-xs text-gray-400 mt-1">Non inscrit</span>
                                      </div>
                                    </td>
                                  );
                                }

                                return (
                                  <td key={month} className={`py-4 px-4 text-center ${
                                    isCurrentMonth ? 'bg-indigo-50 border-l-2 border-indigo-200' : ''
                                  }`}>
                                    <div className="flex flex-col items-center space-y-2">
                                      <button
                                        onClick={() => togglePayment(student.id, month)}
                                        className={`${
                                          isCurrentMonth ? 'w-14 h-14' : 'w-10 h-10'
                                        } rounded-${isCurrentMonth ? 'xl' : 'full'} flex items-center justify-center transition-all duration-200 ${
                                          isPaid
                                            ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
                                            : monthStatus === 'past'
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200 border-2 border-red-300'
                                            : isCurrentMonth
                                            ? 'bg-white text-red-600 hover:bg-red-50 border-3 border-red-300 hover:border-red-400'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border-2 border-gray-300'
                                        } ${isCurrentMonth && isPaid ? 'transform hover:scale-105' : ''}`}
                                        title={`Cliquer pour marquer comme ${isPaid ? 'non payé' : 'payé'} - ${getMonthName(month)}`}
                                      >
                                        {isPaid ? (
                                          <Check className={`${isCurrentMonth ? 'h-8 w-8' : 'h-5 w-5'}`} />
                                        ) : (
                                          <X className={`${isCurrentMonth ? 'h-8 w-8' : 'h-5 w-5'}`} />
                                        )}
                                      </button>
                                      
                                      {isCurrentMonth ? (
                                        <div className="text-center">
                                          <span className={`text-sm font-bold ${
                                            isPaid ? 'text-green-600' : 'text-red-600'
                                          }`}>
                                            {isPaid ? '✅ PAYÉ' : '❌ NON PAYÉ'}
                                          </span>
                                          <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
                                            isPaid 
                                              ? 'bg-green-100 text-green-700'
                                              : 'bg-red-100 text-red-700'
                                          }`}>
                                            {isPaid ? 'Reçu' : 'En attente'}
                                          </div>
                                          {student.price && (
                                            <div className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-full mt-1">
                                              {student.price}€
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <span className={`text-xs font-medium ${
                                          isPaid ? 'text-green-600' : 
                                          monthStatus === 'past' ? 'text-red-600' : 
                                          'text-gray-500'
                                        }`}>
                                          {isPaid ? 'Payé' : monthStatus === 'past' ? 'Retard' : 'Futur'}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Onglet Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Analyses Détaillées</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par Niveau</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.levelDistribution)
                      .filter(([_, count]) => count > 0)
                      .map(([level, count]) => (
                        <div key={level} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{level}</span>
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Revenus</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ce mois</span>
                      <span className="text-lg font-bold text-green-600">
                        {stats.totalRevenue.toFixed(0)}€
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taux de paiement</span>
                      <span className="text-sm font-medium text-gray-900">
                        {stats.paymentRate}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Alertes</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">En attente</span>
                      <span className="text-sm font-medium text-orange-600">
                        {stats.unpaidThisMonth}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">En retard</span>
                      <span className="text-sm font-medium text-red-600">
                        {stats.paymentsOverdue}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Paiements</h3>
                <div className="space-y-4">
                  {displayedMonths.map((month) => {
                    const monthStats = students.reduce((acc, student) => {
                      const studentMonths = getMonthsForStudent(student.subscriptionMonth);
                      if (studentMonths.includes(month)) {
                        acc.total++;
                        if (getPaymentStatus(student.id, month)) {
                          acc.paid++;
                        }
                      }
                      return acc;
                    }, { total: 0, paid: 0 });
                    
                    const percentage = monthStats.total > 0 ? Math.round((monthStats.paid / monthStats.total) * 100) : 0;
                    
                    return (
                      <div key={month} className="flex items-center space-x-4">
                        <div className="w-20 text-sm font-medium text-gray-600">
                          {getShortMonthName(month)}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-16 text-sm font-medium text-gray-900">
                          {monthStats.paid}/{monthStats.total}
                        </div>
                        <div className="w-12 text-sm font-medium text-green-600">
                          {percentage}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé Financier</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Revenus confirmés ce mois</span>
                    <span className="text-lg font-bold text-green-600">{stats.totalRevenue.toFixed(0)}€</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Revenus en attente</span>
                    <span className="text-lg font-bold text-orange-600">
                      {(stats.unpaidThisMonth * (students.reduce((sum, s) => sum + parseFloat(s.price || 0), 0) / students.length || 0)).toFixed(0)}€
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Revenus potentiels totaux</span>
                    <span className="text-lg font-bold text-blue-600">
                      {students.reduce((sum, student) => {
                        const studentMonths = getMonthsForStudent(student.subscriptionMonth);
                        const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
                        return studentMonths.includes(currentMonth) ? sum + parseFloat(student.price || 0) : sum;
                      }, 0).toFixed(0)}€
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire d'ajout/modification */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingStudent ? 'Modifier l\'étudiant' : 'Ajouter un étudiant'}
                  </h2>
                  {saving && (
                    <div className="flex items-center space-x-2 text-indigo-600">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Sauvegarde...</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Prénom de l'étudiant"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Nom de l'étudiant"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="email@exemple.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau *
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="">Sélectionner un niveau</option>
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mois de début d'abonnement *
                    </label>
                    <input
                      type="month"
                      value={formData.subscriptionMonth}
                      onChange={(e) => setFormData({...formData, subscriptionMonth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix mensuel (€)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="50"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Notes supplémentaires..."
                  />
                </div>

                {/* Aperçu de l'étudiant */}
                {(formData.firstName || formData.lastName) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Aperçu</h3>
                    <div className="text-sm text-gray-600">
                      <p><strong>Nom complet:</strong> {formData.firstName} {formData.lastName}</p>
                      {formData.level && <p><strong>Niveau:</strong> {formData.level}</p>}
                      {formData.subscriptionMonth && <p><strong>Abonnement:</strong> {getMonthName(formData.subscriptionMonth)}</p>}
                      {formData.price && <p><strong>Prix mensuel:</strong> {formData.price}€</p>}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={cancelForm}
                  disabled={saving}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving || !formData.firstName || !formData.lastName || !formData.level || !formData.subscriptionMonth}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{editingStudent ? 'Modifier' : 'Ajouter'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages d'erreur */}
        {error && (
          <div className="fixed bottom-4 left-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-2 text-white hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SchoolManagementApp;