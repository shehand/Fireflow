/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global clientId, clientSecret */
//TODO some way to handle accounts that have failing logins instead of just removing them.

class ClientManager extends window.StorageManager {

    static get STACKOVERFLOW() {
        return "stackoverflow";
    }

    static get STACKOVERFLOW_LIGHT() {
        return "stackoverflow-light";
    }

    static get STACKOVERFLOW_USER_TOKEN() {
        return "stackoverflow-user";
    }


    static getTypeForClient(client) {
        
        if(client instanceof window.StackoverflowLight) {
            return ClientManager.Stackoverflow_LIGHT;
        }
        else if(client instanceof window.StackoverflowUserToken) {
            return ClientManager.StACKOVERFLOW_USER_TOKEN;
        }
        return ClientManager.STACKOVERFLOW;
    }

    static async createClient(type, id, details) {
        let ClientFactory;
        if(type === ClientManager.STACKOVERFLOW) {
            ClientFactory = window.Stackoverflow;
        }
        else if(type === ClientManager.STACKOVERFLOW_LIGHT) {
            ClientFactory = window.StackoverflowLight;
        }
        else if(type === ClientManager.STACKOVERFLOW_USER_TOKEN) {
            ClientFactory = window.StackoverflowToken;
            if(!details) {
                throw new Error("Details required to create PAT client");
            }
        }
        const factoryArgs = ClientFactory.buildArgs(clientId, clientSecret, details);
        const client = new ClientFactory(...factoryArgs);
        if(id) {
            client.id = id;
        }
        const wrapper = new window.ClientHandler(client, this.area);
        return wrapper;
    }

    constructor() {
        super(window.ClientHandler);
        this.clients = new Set();
    }

    getClients() {
        return this.clients.values();
    }

    async getInstances() {
        const handlers = await this.getRecords();
        for(const handler of handlers) {
            const wrapper = await ClientManager.createClient(handler.type, handler.id, handler.details);
            const authValid = await wrapper.checkAuth();
            if(authValid) {
                this.addClient(wrapper);
            }
        }

        return !!this.clients.size;
    }

    addClient(client) {
        //TODO ensure no duplicates of accounts are added.
        if(client instanceof window.ClientHandler) {
            this.clients.add(client);
            return this.saveFields();
        }
        return Promise.reject(new TypeError('Client is not a ClientHandler'));
    }

    removeClient(client) {
        this.clients.delete(client);
        return this.saveFields();
    }

    saveFields() {
        const handlers = [];
        for(const client of this.getClients()) {
            const obj = window.StorageManager.createRecord(client);
            obj.type = ClientManager.getTypeForClient(client.client);
            obj.notifications = client.NOTIFICATION_NAME;
            obj.id = client.id;
            obj.details = client.getDetails();
            handlers.push(obj);
        }
        return this.setRecords(handlers);
    }

    async getCount() {
        const clientCounts = await Promise.all(Array.from(this.getClients(), (c) => c.getCount()));
        const START_COUNT = 0;
        return clientCounts.reduce((p, c) => p + c, START_COUNT);
    }

    getClientForNotificationID(id) {
        for(const client of this.getClients()) {
            if(client.ownsNotification(id)) {
                return client;
            }
        }
        throw new Error(`No client has a notification with the id ${id}`);
    }

    getClientById(id) {
        for(const client of this.getClients()) {
            if(client.STORE_PREFIX === id) {
                return client;
            }
        }
        throw new Error(`No client with the id ${id} is registered.`);
    }
}
window.ClientManager = ClientManager;
