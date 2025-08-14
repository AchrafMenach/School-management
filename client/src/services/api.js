const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  // Étudiants
  async getStudents(search = '', level = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (level) params.append('level', level);
    
    return this.request(`/students?${params.toString()}`);
  }

  async createStudent(studentData) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(id, studentData) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  }

  async deleteStudent(id) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  // Paiements
  async getStudentPayments(studentId) {
    return this.request(`/payments/student/${studentId}`);
  }

  async togglePayment(studentId, month) {
    return this.request(`/payments/toggle`, {
      method: 'POST',
      body: JSON.stringify({ studentId, month }),
    });
  }

  // Statistiques
  async getDashboardStats() {
    return this.request('/stats/dashboard');
  }

  async getOverduePayments() {
    return this.request('/payments/overdue');
  }
}

export default new ApiService();