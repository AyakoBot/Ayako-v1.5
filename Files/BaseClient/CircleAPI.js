const axios = require('axios');
const qs = require('qs');
const jobs = require('node-schedule');

const { circleToken: password } = require('./auth.json');
const username = require('./Other Client Files/Constants.json').standard.name.toLowerCase();

const endpoint = 'https://api.circlelabs.xyz';

class CircleApi {
  constructor() {
    this.connect();
  }

  async doRequest(method, path, data = {}, contentType = 'application/json') {
    const url = `${endpoint}${path}`;
    const headers = {
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      'Content-Type': contentType,
    };
    const request = {
      method,
      url,
      ...(Object.keys(data).length && {
        data: contentType === 'application/json' ? data : qs.stringify(data),
      }),
      headers,
    };

    const response = await axios(request)
      .catch((error) => {
        if (error.response) {
          // Server responded with error outside range of 2xx
          throw error.response.data;
        } else if (error.request) {
          // Request made, but no response
          throw error.request;
        } else {
          // Something happened in setting up the request that triggered an Error
          throw error.message;
        }
      })
      .then(({ data: d }) => d);
    return response;
  }

  async login() {
    return this.doRequest(
      'POST',
      '/token',
      { username, password },
      'application/x-www-form-urlencoded',
    ).then((data) => {
      jobs.scheduleJob(new Date(`${data.valid_until}000`), () => this.connect());
      return data.accessToken;
    });
  }

  async createUser(userObject) {
    return this.doRequest('POST', '/users', userObject);
  }

  async getUser(userId) {
    return this.doRequest('GET', `/users/${userId}`);
  }

  async updateUser(userId, userObject) {
    return this.doRequest('PUT', `/users/${userId}`, userObject);
  }

  async deleteUser(userId) {
    return this.doRequest('DELETE', `/users/${userId}`);
  }

  async searchUsers(userQuery) {
    return this.doRequest('GET', '/users', userQuery, 'application/x-www-form-urlencoded');
  }

  async onboardUser(userId) {
    return this.doRequest('PUT', `/users/${userId}/onboard`);
  }

  async onboardUserForShape(userId, shapeId, onboardingState) {
    return this.doRequest('PUT', `/shapes/${shapeId}/onboard/${userId}`, onboardingState);
  }

  async updateUserState(userId, shapeId, state) {
    return this.doRequest('PUT', `/shapes/${shapeId}/state/${userId}`, state);
  }

  async createShape(shapeObject) {
    return this.doRequest('POST', `/shapes`, shapeObject);
  }

  async getShape(shapeId) {
    return this.doRequest('GET', `/shapes/${shapeId}`);
  }

  async searchShapes(shapeQuery) {
    return this.doRequest('GET', '/shapes', shapeQuery);
  }

  async updateShape(shapeId, shapeObject) {
    return this.doRequest('PUT', `/shapes/${shapeId}`, shapeObject);
  }

  async deleteShape(shapeId) {
    return this.doRequest('DELETE', `/shapes/${shapeId}`);
  }

  async wackShape(shapeId, userId) {
    return this.doRequest('POST', `/shapes/${shapeId}/wack/${userId}`);
  }

  async createMessage(messageObject) {
    return this.doRequest('POST', '/messages', messageObject);
  }

  async updateMessage(messageId, messageObject) {
    return this.doRequest('PUT', `/messages/${messageId}`, messageObject);
  }

  async searchMessages(messageQuery) {
    return this.doRequest('GET', '/messages', messageQuery, 'application/x-www-form-urlencoded');
  }

  async connect() {
    this.token = await this.login().catch((err) => {
      throw JSON.stringify(err, null, 2);
    });
  }
}

module.exports = CircleApi;
