/**
 * API service - re-exports and consolidates API calls
 */
import api from './apiClient';
import * as userService from './userService';
import * as pandoraService from './pandoraService';
import * as orderService from './orderService';

export { default as api } from './apiClient';
export { userService, pandoraService, orderService };

export default api;
