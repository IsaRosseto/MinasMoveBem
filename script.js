/* script.js */

// Funções utilitárias para localStorage
function getData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setData(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

// Funções de Login, Logout e Verificação
function loginUser(email, password, isSupplierLogin) {
  const users = getData('users');
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return false;
  if (isSupplierLogin && !user.isSupplier) return false;
  // Desloga todos e loga o usuário encontrado
  users.forEach(u => u.isLoggedIn = false);
  user.isLoggedIn = true;
  setData('users', users);
  return true;
}

function logoutUser() {
  const users = getData('users');
  users.forEach(u => u.isLoggedIn = false);
  setData('users', users);
}

function getLoggedUser() {
  const users = getData('users');
  return users.find(u => u.isLoggedIn === true);
}

// Cadastro e Atualização de Perfil
function registerUser(email, password, name, isSupplier, specialPassword) {
  const users = getData('users');
  if (users.some(u => u.email === email)) {
    return { success: false, msg: "E-mail já cadastrado" };
  }
  let supplierFlag = false;
  if (isSupplier) {
    if (specialPassword === "220423") {
      supplierFlag = true;
    } else {
      return { success: false, msg: "Senha especial incorreta" };
    }
  }
  const newUser = {
    id: Date.now(),
    email: email,
    password: password,
    name: name,
    description: "",
    photo: "",
    isSupplier: supplierFlag,
    isAdmin: false,
    isLoggedIn: false,
    rentals: []
  };
  users.push(newUser);
  setData('users', users);
  return { success: true, msg: "Usuário cadastrado com sucesso" };
}

function updateUserProfile(userId, { name, description, photo, email }) {
  const users = getData('users');
  const user = users.find(u => u.id === userId);
  if (!user) return false;
  if (name !== undefined) user.name = name;
  if (description !== undefined) user.description = description;
  if (photo !== undefined) user.photo = photo;
  if (email !== undefined) user.email = email;
  setData('users', users);
  return true;
}

// CRUD de Veículos com controle de data de aluguel (rentUntil)
function createVehicle({ name, description, price, photo, status, ownerId, category }) {
  const vehicles = getData('vehicles');
  const newVehicle = {
    id: Date.now(),
    name: name,
    description: description,
    price: typeof price === "string" ? parsePriceToNumber(price) : price,
    photo: photo,
    status: status || "Disponível",
    ownerId: ownerId,
    category: category,
    rentUntil: null  // Data final do aluguel
  };
  vehicles.push(newVehicle);
  setData('vehicles', vehicles);
  return newVehicle;
}

function updateVehicle(vehicleId, fields) {
  const vehicles = getData('vehicles');
  const vehicle = vehicles.find(v => v.id == vehicleId);
  if (!vehicle) return false;
  Object.keys(fields).forEach(key => {
    vehicle[key] = fields[key];
  });
  setData('vehicles', vehicles);
  return true;
}

function deleteVehicle(vehicleId) {
  let vehicles = getData('vehicles');
  vehicles = vehicles.filter(v => v.id != vehicleId);
  setData('vehicles', vehicles);
  return true;
}

function getAllVehicles() {
  return getData('vehicles');
}

function getVehicleById(vehicleId) {
  const vehicles = getData('vehicles');
  return vehicles.find(v => v.id == vehicleId);
}

// Converte string de preço para número, ou retorna se já for número
function parsePriceToNumber(priceStr) {
  if (typeof priceStr === "number") return priceStr;
  const cleaned = priceStr.replace(/[^\d,\.]/g, '').replace(',', '.');
  return parseFloat(cleaned);
}

// Atualiza automaticamente o status de veículos alugados se a data final (rentUntil) já passou
function autoUpdateVehicleStatus() {
  const vehicles = getData('vehicles');
  const today = new Date();
  let changed = false;
  vehicles.forEach(v => {
    if (v.status === "Alugado" && v.rentUntil) {
      const rentUntilDate = new Date(v.rentUntil);
      if (today > rentUntilDate) {
        v.status = "Disponível";
        v.rentUntil = null;
        changed = true;
      }
    }
  });
  if (changed) {
    setData('vehicles', vehicles);
  }
}

// Funções de Avaliação
function createReview({ userId, vehicleId, rating, comment }) {
  const reviews = getData('reviews');
  let existing = reviews.find(r => r.userId == userId && r.vehicleId == vehicleId);
  if (existing) {
    existing.rating = rating;
    existing.comment = comment;
  } else {
    const newReview = {
      id: Date.now(),
      userId: userId,
      vehicleId: vehicleId,
      rating: rating,
      comment: comment
    };
    reviews.push(newReview);
  }
  setData('reviews', reviews);
  return true;
}

function getAllReviews() {
  return getData('reviews');
}

function getReviewsByVehicle(vehicleId) {
  return getAllReviews().filter(r => r.vehicleId == vehicleId);
}

// Inicialização com dados falsos, se não existir nada em localStorage
function initFakeData() {
  if (!localStorage.getItem('users')) {
    const initialUsers = [
      {
        id: 1,
        email: "i@g",
        password: "1111",
        name: "Administrador",
        description: "Gerencio todo o sistema",
        photo: "",
        isSupplier: false,
        isAdmin: true,
        isLoggedIn: false,
        rentals: []
      },
      {
        id: 2,
        email: "fornecedor@example.com",
        password: "123",
        name: "Fornecedor Teste",
        description: "Tenho vários veículos para alugar.",
        photo: "",
        isSupplier: true,
        isAdmin: false,
        isLoggedIn: false,
        rentals: []
      },
      {
        id: 3,
        email: "cliente@example.com",
        password: "123",
        name: "Cliente Teste",
        description: "Adoro viajar!",
        photo: "",
        isSupplier: false,
        isAdmin: false,
        isLoggedIn: false,
        rentals: []
      }
    ];
    setData('users', initialUsers);
  }
  if (!localStorage.getItem('vehicles')) {
    setData('vehicles', []);
  }
  if (!localStorage.getItem('reviews')) {
    setData('reviews', []);
  }
}

initFakeData();
