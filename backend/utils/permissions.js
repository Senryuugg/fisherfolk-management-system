// Advanced RBAC permissions matrix
// Defines what each role can do with each resource

export const permissions = {
  admin: {
    fisherfolk: { view: true, create: true, edit: true, delete: true, export: true, import: true },
    boats: { view: true, create: true, edit: true, delete: true, export: true, import: true },
    gears: { view: true, create: true, edit: true, delete: true, export: true, import: true },
    organizations: { view: true, create: true, edit: true, delete: true, export: true, import: true },
    committees: { view: true, create: true, edit: true, delete: true, export: true },
    officers: { view: true, create: true, edit: true, delete: true, export: true },
    ordinances: { view: true, create: true, edit: true, delete: true, export: true },
    faqs: { view: true, create: true, edit: true, delete: true },
    tickets: { view: true, create: true, edit: true, delete: true },
    developmentLevels: { view: true, create: true, edit: true, delete: true },
    maps: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, generate: true, export: true },
    auditLogs: { view: true },
    users: { view: true, create: true, edit: true, delete: true },
    permissions: { view: true, edit: true },
  },
  lgu: {
    fisherfolk: { view: true, create: true, edit: true, delete: false, export: true, import: true },
    boats: { view: true, create: true, edit: true, delete: false, export: true, import: true },
    gears: { view: true, create: true, edit: true, delete: false, export: true, import: true },
    organizations: { view: true, create: true, edit: true, delete: false, export: true },
    committees: { view: true, create: true, edit: true, delete: false, export: true },
    officers: { view: true, create: true, edit: true, delete: false, export: true },
    ordinances: { view: true, create: false, edit: false, delete: false, export: true },
    faqs: { view: true, create: false, edit: false, delete: false },
    tickets: { view: true, create: true, edit: true, delete: false },
    developmentLevels: { view: true, create: false, edit: false, delete: false },
    maps: { view: true, create: true, edit: true, delete: false },
    reports: { view: true, generate: true, export: true },
    auditLogs: { view: false },
    users: { view: false, create: false, edit: false, delete: false },
    permissions: { view: false, edit: false },
  },
  viewer: {
    fisherfolk: { view: true, create: false, edit: false, delete: false, export: true, import: false },
    boats: { view: true, create: false, edit: false, delete: false, export: true, import: false },
    gears: { view: true, create: false, edit: false, delete: false, export: true, import: false },
    organizations: { view: true, create: false, edit: false, delete: false, export: true },
    committees: { view: true, create: false, edit: false, delete: false, export: false },
    officers: { view: true, create: false, edit: false, delete: false, export: false },
    ordinances: { view: true, create: false, edit: false, delete: false, export: false },
    faqs: { view: true, create: false, edit: false, delete: false },
    tickets: { view: true, create: true, edit: false, delete: false },
    developmentLevels: { view: true, create: false, edit: false, delete: false },
    maps: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, generate: false, export: false },
    auditLogs: { view: false },
    users: { view: false, create: false, edit: false, delete: false },
    permissions: { view: false, edit: false },
  },
};

// Field-level access control - which fields each role can see/edit
export const fieldAccess = {
  admin: {
    fisherfolk: { view: ['*'], edit: ['*'] }, // Can see and edit all fields
  },
  lgu: {
    fisherfolk: {
      view: ['*'],
      edit: ['firstName', 'lastName', 'age', 'phone', 'email', 'province', 'estimatedIncome'],
      hidden: [], // No hidden fields
    },
  },
  viewer: {
    fisherfolk: {
      view: ['firstName', 'lastName', 'age', 'province', 'registrationDate'],
      edit: [],
      hidden: ['phone', 'email', 'address', 'estimatedIncome'], // Hide sensitive info
    },
  },
};

// Check if user has permission for an action
export const hasPermission = (userRole, resource, action) => {
  if (!permissions[userRole]) {
    return false;
  }

  const resourcePerms = permissions[userRole][resource];
  if (!resourcePerms) {
    return false;
  }

  return resourcePerms[action] === true;
};

// Get all permissions for a role
export const getRolePermissions = (role) => {
  return permissions[role] || {};
};

// Get accessible fields for viewing
export const getViewableFields = (userRole, resource) => {
  const access = fieldAccess[userRole]?.[resource];
  if (!access) {
    return []; // No access by default
  }

  if (access.view.includes('*')) {
    return ['*']; // All fields
  }

  return access.view;
};

// Get editable fields
export const getEditableFields = (userRole, resource) => {
  const access = fieldAccess[userRole]?.[resource];
  if (!access) {
    return []; // No access by default
  }

  return access.edit || [];
};

// Get hidden fields
export const getHiddenFields = (userRole, resource) => {
  const access = fieldAccess[userRole]?.[resource];
  if (!access) {
    return []; // No hidden fields by default
  }

  return access.hidden || [];
};

// Filter data based on user role
export const filterDataByRole = (data, userRole, resource) => {
  if (!Array.isArray(data)) {
    data = [data];
  }

  const viewableFields = getViewableFields(userRole, resource);
  const hiddenFields = getHiddenFields(userRole, resource);

  if (viewableFields.includes('*')) {
    // Remove hidden fields if any
    return data.map(item => {
      const filtered = { ...item };
      hiddenFields.forEach(field => {
        delete filtered[field];
      });
      return filtered;
    });
  }

  // Only include viewable fields
  return data.map(item => {
    const filtered = {};
    viewableFields.forEach(field => {
      if (field in item) {
        filtered[field] = item[field];
      }
    });
    return filtered;
  });
};

export default {
  permissions,
  fieldAccess,
  hasPermission,
  getRolePermissions,
  getViewableFields,
  getEditableFields,
  getHiddenFields,
  filterDataByRole,
};
