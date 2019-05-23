;(function (){
	"use strict";

	/*
	 * Manages everything crypto-related like keys and en- and decryption
	 */
	
	/*
	 * Constructor
	 * 
	 * chat: chatObjekt
	 */
	function CryptoStorage (chat) {
		"use strict";
		this.chat = chat;
		this.transport = chat.transport;
		this.chatId = -1;
		this.userObject = null;
		this.encryptedLoginPassphrase = null;
		this.encryptedPassphrase = null;
		this.storage = {
				test: Date()
		};
	};
	
	/*
	 * clears temporary variable
	 */
	CryptoStorage.prototype.clear = function () {
		"use strict";
		this.clearTemp();
		this.storage = {};
		this.chatId = -1;
		this.userObject = null;
		this.encryptedLoginPassphrase = null;
		this.encryptedPassphrase = null;
	}	
	
	/*
	 * clears temporary variable
	 */
	CryptoStorage.prototype.clearTemp = function () {
		"use strict";
		this.temp = null;
	}
	
	/*
	 * login of user with username and passphrase
	 * 
	 * username: string
	 * passphrase: string of unencrypted passphrase
	 */
	CryptoStorage.prototype.login = function (username, passphrase) {
		"use strict";
		this.temp = {
			passphrase: passphrase,
			username: username
		};
		return this.transport.getSalt(username);
	}
	
	/*
	 * Callback, login of user when salt arrives from server
	 * 
	 * salt: string from server
	 */
	CryptoStorage.prototype.getSaltCallback = function (salt) {
		"use strict";
		return this.sha512(this.temp.passphrase, salt).then(function (encryptedLoginPassphrase) {
			this.encryptedLoginPassphrase = encryptedLoginPassphrase;
			return this.transport.login(this.temp.username, encryptedLoginPassphrase);
		}.bind(this));
	}
	
	/*
	 * Callback, when server sends userobject
	 * 
	 * userObject: json-object of user
	 */
	CryptoStorage.prototype.loginCallback = function (userObject) {
		"use strict";
		this.userObject = userObject;
		
		return this.importPublicKey({id: userObject.id, publicKey: userObject.publicKey}).then(function (pk) {
			return this.deriveKey(this.temp.passphrase, userObject.keySalt).then(function (key) {
				this.temp.passphrase = "";
				this.put("aesKey", key);
				this.chat.setUserObject(userObject);
				this.initializeStorage();
			}.bind(this));
		}.bind(this));
	}
	
	/*
	 * serialization of storage, afterward encrypts it and sends it to the server
	 */
	CryptoStorage.prototype.store = function () {
		"use strict";
		this.serializeStorage(this.storage).then(function (storage) {
			this.encrypt(storage).then(function (encryptedStorage) {
				this.transport.storeStorage(this.userObject.id, arrayBufferToString(encryptedStorage.ciphertext), arrayBufferToString(encryptedStorage.iv));
			}.bind(this));
		}.bind(this));
	}
	
	/*
	 * initializes storage (which is in userobject), decrypts it and deserializes it
	 */
	CryptoStorage.prototype.initializeStorage = function () {
		"use strict";
		return this.decryptStorage().then(function (storage) {
			this.deserializeStorage(storage).then(function (deserializedStorage) {
				for (var key in deserializedStorage) {
					if (deserializedStorage.hasOwnProperty(key) && key.indexOf("aesKey") == -1) {
						this.storage[key] = deserializedStorage[key];
					}
				}
			}.bind(this));
		}.bind(this));
	}
	
	/*
	 * Deserialization of storage-objet
	 * 
	 * storage: json-object of storage or stringified json-object
	 */
	CryptoStorage.prototype.deserializeStorage = function (storage) {
		"use strict";
		var storageObject = storage;
		if (typeof storage == "string") {
			storageObject = JSON.parse(storage);
		}
		var storage = {};
		var promises = [];
		for (var key in storageObject) {
			if (storageObject.hasOwnProperty(key)) {
				if (key.indexOf("FromArrayBuffer_") > -1) {
					var newKey = key.substr(16);
					promises.push(Promise.resolve({key: newKey, value: toBuffer(storageObject[key])}));
				} else if (key.indexOf("FromPrivateKey_") > -1) {
					var newKey = key.substr(15);
					promises.push(this.importRSAKey(storageObject[key], "privateKey").then(function (privateKey) {
						return {key: newKey, value: privateKey};
					}));
				} else if (typeof storageObject[key] == "object") {
					promises.push(this.deserializeStorage(storageObject[key]).then(function (deserialized) {
						return {key: storageObject[key], value: deserialized};
					}));
				} else {
					promises.push(Promise.resolve({key: key, value: storageObject[key]}));
				}
			}
		}
		return Promise.all(promises).then(function (results) {
			results.forEach(function (result) {
				storage[result.key] = result.value;
			});
			return storage;
		});
	}
	
	/*
	 * Serializes a storage-object
	 * 
	 * storage: json-object
	 */
	CryptoStorage.prototype.serializeStorage = function (storage) {
		"use strict";
		var storageObject = {};
		var promises = [];
		for (var key in storage) {
			if (storage.hasOwnProperty(key) && key.indexOf("publicKey") == -1) {
				if (storage[key] instanceof ArrayBuffer || storage[key] instanceof Uint8Array) {
					promises.push(Promise.resolve({key: "FromArrayBuffer_"+key, value: arrayBufferToString(storage[key])}));
				} else if (typeof storage[key] == "object" && !(storage[key] instanceof CryptoKey)) {
					promises.push(this.serializeStorage(storage[key]).then(function (serialized) {
						return {key: key, value: serialized};
					}));
				} else if (typeof storage[key] == "object" && storage[key] instanceof CryptoKey && key.indexOf("aesKey") == -1) {
					promises.push(this.exportKey(storage[key]).then(function (exportKey) {
						return {key: "FromPrivateKey_"+key, value: exportKey};
					}));
				} else if (key.indexOf("aesKey") == -1){
					promises.push(Promise.resolve({key: key, value: storage[key]}));
				}
			}
		}
		return Promise.all(promises).then(function (results) {
			results.forEach(function (result) {
				storageObject[result.key] = result.value;
			});
			return storageObject;
		});
	}
	
	/*
	 * Loads chat from server
	 * 
	 * chatId: int Id of chat
	 */
	CryptoStorage.prototype.getChat = function (chatId) {
		"use strict";
		this.chatId = chatId;
		return Promise.all([
			this.getChatKeys(chatId),
			this.transport.getChatMessages(chatId),
		]).then(function (results) {
			return this.decryptMessages(results[1]);
		});
	}
	
	/*
	 * saves chat keys to storage
	 * 
	 * chatKeys: json-List of chat keys
	 */
	CryptoStorage.prototype.putChatKeys = function (chatKeys) {
		"use strict";
		var keys = [];
		for (var i=0; i<chatKeys.length; i++) {
			keys.push(this.decryptWithPrivateKey(toBuffer(chatKeys[i].chatKey), toBuffer(chatKeys[i].salt), chatKeys[i].chatKeyId, chatKeys[i].chatId).then(function (decrypted) {
				var chatKeyObject = JSON.parse(arrayBufferToString(decrypted.plaintext));
				return this.putChatKey(chatKeyObject, decrypted.keyId, decrypted.chatId).then(function (ck) {
					return ck;
				});
			}.bind(this)));
		}
		return Promise.all(keys).then(function () {
			return true;
		}.bind(this));
	}
	
	/*
	 * saves a chatKey to the storage
	 * 
	 * chatKey: json-object
	 * chatKeyId: int Id of key
	 * chatId: int Id of chat
	 */
	CryptoStorage.prototype.putChatKey = function (chatKey, chatKeyId, chatId) {
		"use strict";
		if (chatId == null) {
			chatId = this.chatId;
		}
		if (this.chatKeys == null) {
			this.chatKeys = {};
		}
		if (this.chatKeys[chatId] == null) {
			this.chatKeys[chatId] = {};
		}
		if (this.chatKeys[chatId][chatKeyId] != null) {
			return Promise.resolve(this.chatKeys[chatId][chatKeyId]);
		}
		return this.importAESKey(chatKey).then(function (aesKey) {
			var aesKeyObject = {key: aesKey, id: chatKeyId};
			this.chatKeys[chatId][chatKeyId] = aesKeyObject;
			return aesKeyObject;
		}.bind(this));
	}
	
	/*
	 * Loads the key for a chat and a keyId from storage
	 * 
	 * chatKeyId: int Id of key
	 * chatId: int Id of chat
	 */
	CryptoStorage.prototype.getChatKey = function (chatKeyId, chatId) {
		"use strict";
		if (chatId == null) {
			chatId = this.chatId;
		}
		var toReturn = null;
		if (this.chatKeys != null && this.chatKeys[chatId] != null && this.chatKeys[chatId][chatKeyId] != null) {
			return this.chatKeys[chatId][chatKeyId];
		}
		return null;
	}
	
	/*
	 * Loads last key of a chat from Storage
	 * 
	 * chatId: int Id of chat
	 */
	CryptoStorage.prototype.getLatestMessageKey = function(chatId) {
		"use strict";
		if (chatId == null) {
			chatId = this.chatId;
		}
		
		var latestKey = {id: -1};
		for(var k in this.chatKeys[chatId]) {
			if (this.chatKeys[chatId].hasOwnProperty(k)) {
				var ck = parseInt(this.chatKeys[chatId][k].id);
				var lk = parseInt(latestKey.id);
				if (ck > lk) {
					latestKey = this.chatKeys[chatId][k];
				}
			}
		}
		return latestKey;
	}
	
	/*
	 * loads a message key from storage
	 * 
	 * chatId: int Id of chat
	 * chatKeyId: int Id of key
	 */
	CryptoStorage.prototype.getMessageKey = function(chatId, chatKeyId) {
		"use strict";
		if (this.chatKeys[chatId] == null || this.chatKeys[chatId][chatKeyId] == null) {
			throw "Messagekey nicht gefunden!";
		}
		return this.chatKeys[chatId][chatKeyId];
	}
	
	/*
	 * inserts Key,Value to storage
	 * 
	 * key: string
	 * value: string, int, float, ...
	 */
	CryptoStorage.prototype.put = function (key, value) {
        "use strict";
        if (key === undefined || value === undefined || key === null || value === null)
            throw "Key oder Value nicht definiert!";
        return this.storage[key] = value;
	}
	
	/*
	 * Removes key and Value from storage
	 * 
	 * key: string
	 */
    CryptoStorage.prototype.remove = function (key) {
        "use strict";
        if (key === null || key === undefined)
            throw "Key oder Value nicht definiert!";
        delete this.storage[key];
    }
	
    /*
     * Returns Value to a key from storage or default, if no key exists
     * 
     * key: string
     * defaultValue: ...
     */
	CryptoStorage.prototype.get = function (key, defaultValue) {
        "use strict";
        if (key === null || key === undefined)
            throw "Key oder Value nicht definiert!";
        if (key in this.storage) {
            return this.storage[key];
        } else {
            return defaultValue;
        }
	}
	
	/*
	 * Tries to return publicKey of a user from storage, returns object with user id otherwise
	 * 
	 * userId: int Id of user
	 */
	CryptoStorage.prototype.getPublicKey = function (userId) {
		"use strict";
		var userId = userId;
		if (userId == null) {
			userId = this.userObject.id;
		}
		
		if (this.storage.publicKeys != null && this.storage.publicKeys[userId] != null) {
			return {id: userId, key:this.storage.publicKeys[userId]};
		} 
		return {id: userId};
	}
	
	/*
	 * Imports list of public keys to the storage
	 * 
	 * publicKeyPairs: json-liste of Key,Id-pairs
	 */
	CryptoStorage.prototype.importPublicKeys = function (publicKeyPairs) {
		"use strict";
		var imported = [];
		for (var i=0; i<publicKeyPairs.length; i++) {
			imported.push(this.importPublicKey(publicKeyPairs[i]));
		}
		return Promise.all(imported).then(function (imported) {
			return imported;
		});
	}
	
	/*
	 * Imports public keys to the storage
	 * 
	 * publicKey: json-Objekt (key)
	 */
	CryptoStorage.prototype.importPublicKey = function (publicKey) {
		"use strict";
		if (this.storage.publicKeys == null) {
			this.storage.publicKeys = {};
		}
		return this.importRSAKey(JSON.parse(publicKey.publicKey), "publicKey").then(function (rsaKey) {
			this.storage.publicKeys[publicKey.id] = rsaKey;
			return {id: publicKey.id, key: rsaKey};
		}.bind(this));
	}
	
	/*
	 * Callback, when list of public keys from server arrives. imports it to the storage afterward
	 * 
	 * publicKeys: json-List of public keys
	 */
	CryptoStorage.prototype.getPublicKeysCallback = function (publicKeys) {
		"use strict";
		if (this.storage.publicKeys == null) {
			this.storage.publicKeys = {};
		}
		var imported = [];
		
		publicKeys.forEach(function (pk) {
			imported.push(this.importPublicKey(pk));
		}.bind(this));

		Promise.all(imported).then(function (importedKeys) {
			var keyPairs = [];
			if (this.temp != null && this.temp.keys != null && this.temp.keys[this.chatId] != null) {
				this.temp.keys[this.chatId].forEach(function (pk) {
					keyPairs.push(pk);
				});
				this.temp.keys[this.chatId] = [];
			}
			importedKeys.forEach(function (ik) {
				keyPairs.push(ik);
			});
			this.chat.getPublicKeysCallback(keyPairs);
		}.bind(this));
	}
	
	/*
	 * Returns public key from storage for a list of user ids
	 * 
	 * userIds: json-list of user Ids
	 */
	CryptoStorage.prototype.getPublicKeys = function (userIds) {
		"use strict";
		var keys = [];
		var missingKeyUserIds = [];
		userIds.forEach(function (userId) {
			if (Number.isInteger(Number.parseInt(userId))) {
				var pk = this.getPublicKey(userId);
				if (pk.key != null) {
					keys.push(pk);
				} else {
					missingKeyUserIds.push(pk.id);
				}
			}
		}.bind(this));
		if (missingKeyUserIds.length == 0) {
			return keys;
		} else {
			if (this.temp == null) {
				this.temp = {};
			}
			if (this.temp.keys == null) {
				this.temp.keys = {};
			}
			this.temp.keys[this.chatId] = keys;
			this.transport.getPublicKeys(missingKeyUserIds);
			return null;
		}
	}
	
	/*
	 * Crypto:
	 */
	
	/*
	 * Decrypts storage-object (from oserObject) and returns string as Promise
	 */
	CryptoStorage.prototype.decryptStorage = function () {
		"use strict";
		return this.decryptData(toBuffer(this.userObject.storage), this.storage.aesKey, toBuffer(this.userObject.salt)).then(function (storage) {
			return arrayBufferToString(storage);
		});
	}
	
	/*
	 * Decrypts List of Messages, returns list as Promise
	 * 
	 * messages: json-List of encrypted messages
	 */
	CryptoStorage.prototype.decryptMessages = function(messages) {
		"use strict";
		var decryptedMessages = [];
		for (var i=0; i<messages.length; i++) {
			decryptedMessages.push(this.decryptMessage(messages[i]));
		}
		return Promise.all(decryptedMessages).then(function (decrypted) {
			return decrypted;
		});
	}
	
	/*
	 * Decrypts a message, returns a Promise
	 * 
	 * message: json-Object of an encrypted message
	 */
	CryptoStorage.prototype.decryptMessage = function(message) {
		"use strict";
		var messageKey = this.getMessageKey(message.chatId, message.chatKeyId).key
        var dataBuffer = toBuffer(message.content);
		var ivBuffer = toBuffer(message.salt);
		return this.decryptData(dataBuffer, messageKey, ivBuffer).then(function (plaintext) {
			message.plaintext = arrayBufferToString(plaintext);
			return message;
		});
	}
	
	/*
	 * Decrypts databuffer with keybuffer and IV or Salt and returns Promise of plaintexts (as buffer) 
	 * 
	 * dataBuffer: Buffer
	 * keyBuffer: Buffer
	 * ivBuffer: Buffer
	 */
	CryptoStorage.prototype.decryptData = function (dataBuffer, keyBuffer, ivBuffer) {
		"use strict";
		if (keyBuffer == null || dataBuffer == null || ivBuffer == null) {
			throw "Data, Key or IV is empty!";
		}
        return window.crypto.subtle.decrypt({ name: 'AES-CBC', iv: ivBuffer }, keyBuffer, dataBuffer).then(function (plaintext) {
            return plaintext;
        }).catch(function (exception) {
            console.log(exception);
            return null;
        });
	}
	
	/*
	 * Encrypts messages with last Messagekey, returns list of encrtypted messages as Promise
	 * 
	 * messages: json-List of Messages
	 */
	CryptoStorage.prototype.encryptMessages = function(messages) {
		"use strict";
		var encryptedMessages = [];
		for (var i=0; i<messages.length; i++) {
			encryptedMessages.push(this.encryptMessage(messages[i]));
		}
		return encryptedMessages;
	}
	
	/*
	 * Encrypts message with last messagekey, returns promise
	 * 
	 * message: json-Object of message
	 */
	CryptoStorage.prototype.encryptMessage = function(message) {
		"use strict";
		var messageKey = this.getLatestMessageKey(this.chatId);
        var dataBuffer = toBuffer(message);
        return this.encryptData(dataBuffer, messageKey.key, messageKey.id);
	}
	
	/*
	 * Encrypts Data with Key and KeyId, returns object with Ciphertext, IV, and keyid as Promise
	 * 
	 * dataBuffer: Buffer
	 * key: json-Object
	 * keyId: int Id of key
	 */
	CryptoStorage.prototype.encryptData = function (dataBuffer, key, keyId) {
        "use strict";
		if (key == null || dataBuffer == null) {
			throw "Data or Key is empty!";
		}
        var iv = this.generateRandomArray(16);
        return window.crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv }, key, dataBuffer).then(function (data) {
            return { ciphertext: data, iv: iv, keyId: keyId };
        });
    }
	
	/*
	 * Encrypts Data with AES-Key, returns objekc with Ciphertext and IV as Promise
	 * 
	 * data: data
	 */
	CryptoStorage.prototype.encrypt = function (data) {
        "use strict";
        var keyBuffer = this.get("aesKey");
        var dataBuffer = toBuffer(data);
		if (keyBuffer == null || dataBuffer == null) {
			throw "Data or Key is empty!";
		}
        var iv = this.generateRandomArray(16);
        return window.crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv }, keyBuffer, dataBuffer).then(function (data) {
            return { ciphertext: data, iv: iv };
        });
	}
	
	/*
	 * Encrypts data with a public key, returns object with Ciphertext, IV, and UserId as Promise
	 * 
	 * data: Data
	 * publicKey: json-Object of key
	 * userId: int Id of user, for whom the data is encrypted
	 */
	CryptoStorage.prototype.encryptWithPublicKey = function (data, publicKey, userId) {
        "use strict";
        var dataBuffer = toBuffer(data);
        
		if (dataBuffer == null || !(publicKey instanceof CryptoKey)) {
			throw "Data or Key is wrong!";
		}
		var ivBuffer = this.generateRandomArray(16);
		return crypto.subtle.encrypt({name: "RSA-OAEP", iv: ivBuffer}, publicKey, dataBuffer).then(function (encrypted) {
			if (userId != null) {
				return {ciphertext: encrypted, iv: ivBuffer, userId: userId};
			}
			return {ciphertext: encrypted, iv: ivBuffer};
		});
	}
	
	/*
	 * Decrypts Data with private key of a user, returns decrypted data as buffer, if data does not belong to a specific chat,
	 * otherwise as object
	 * as Promise
	 * 
	 * data: Data
	 * iv: Buffer or String
	 * keyId: can be NULL int Id otherwise
	 * chatId: can be NULL int Id otherwise
	 */
	CryptoStorage.prototype.decryptWithPrivateKey = function (data, iv, keyId, chatId) {
        "use strict";
        var dataBuffer = toBuffer(data);
		var ivBuffer = toBuffer(iv);
		var privateKey = this.get("privateKey");
		if (dataBuffer == null || privateKey == null || ivBuffer == null) {
			throw "Data, IV or Key is wrong!";
		}
		
		return crypto.subtle.decrypt({name: "RSA-OAEP", iv: ivBuffer}, privateKey, dataBuffer).then(function (decrypted) {
			if (keyId == null || chatId == null) {
				return decrypted;
			} 
			return {plaintext: decrypted, keyId: keyId, chatId: chatId};	
		});
	}
	
	/*
	 * Creates Unsigned8bit-Array (of random data) of a specific length
	 * 
	 * length: int length of Array
	 */
	CryptoStorage.prototype.generateRandomArray = function (length) {
		"use strict";
		return window.crypto.getRandomValues(new Uint8Array(length));
	}
	
	/*
	 * Derives key from passphrase with a salt, imports it and returns it as json-object (Promise)
	 * 
	 * passphrase: string
	 * salt: string
	 */
	CryptoStorage.prototype.deriveKey = function (passphrase, salt) {
        "use strict";
        var passArray = toBuffer(passphrase);
        var saltArray = toBuffer(salt);
        
		if (passArray == null || saltArray == null) {
			throw "Key or Salt is empty!";
		}
        return window.crypto.subtle.importKey(
        	"raw",
            passArray,
            { name: "PBKDF2" },
            false,
            ["deriveKey"]).then(function (key) {
                return window.crypto.subtle.deriveKey(
                    { name: "PBKDF2", salt: saltArray, iterations: 1000, hash: "SHA-512" },
                    key,
                    { name: "AES-CBC", length: 256 },
                    true,
                    ["encrypt", "decrypt"])
            }.bind(this)).then(function (webKey) {
            	this.exportKey(webKey).then(function(ek) {
            	});
                return webKey;
            }.bind(this));
    }
	
	/*
	 * Generates a new key (AES 256) and returns as Promise
	 */
	CryptoStorage.prototype.generateKey = function () {
        "use strict";
        return window.crypto.subtle.generateKey(
        	    {
        	        name: "AES-CBC",
        	        length: 256,
        	    },
        	    true,
        	    ["encrypt", "decrypt"]
        	)
        	.then(function(key){
        		return key;
        	})
        	.catch(function(err){
        	    console.error(err);
        	});
	}
	
	/*
	 * Generieres RSA-Key-Pair (SHA512) and returns as Promise
	 */
	CryptoStorage.prototype.generateKeys = function () {
        "use strict";
        return window.crypto.subtle.generateKey(
        		{
        			name: "RSA-OAEP",
			        modulusLength: 2048,
			        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
			        hash: 
			        {
			        	name: "SHA-512"
			        },
			    },
			    true,
			    ["encrypt", "decrypt"]
			)
			.then(function(key){
				return key;
			});
	}
	
	/*
	 * Imports RSA-key and returns as json-Object (Promise)
	 * 
	 * key: json-Object
	 * type: string "publicKey" or "privateKey"
	 */
	CryptoStorage.prototype.importRSAKey = function (key, type) {
		"use strict";
		var usage = "encrypt";
		if (type == "publicKey" || type == "encrypt") {
			usage = "encrypt";
		} else if (type == "privateKey" || type == "decrypt") {
			usage = "decrypt";
		} else {
			throw "Schlüsseltyp fehlt!";
		}
		return window.crypto.subtle.importKey(
				"jwk", 
				key, 
				{
					name: "RSA-OAEP", 
					hash: 
					{
						name: "SHA-512"
					}, 
				},
			    true,
			    [usage]
			).then(function(key) {
				return key;
			});
	}
	
	/*
	 * Imports an AES-Key and returns as promise
	 * 
	 * key: json-Object
	 */
	CryptoStorage.prototype.importAESKey = function (key) {
		"use strict";
		return window.crypto.subtle.importKey(
			    "jwk",
			    key,
			    {
			        name: "AES-CBC",
			    },
			    true,
			    ["encrypt", "decrypt"]
			)
			.then(function(key){
				return key;
			});
	}
	
	/*
	 * Exports a keyobject as Json, inside Promise
	 * 
	 * key: keyobject
	 */
	CryptoStorage.prototype.exportKey = function (key) {
		"use strict";
		return window.crypto.subtle.exportKey("jwk", key).then(function(exportKey){
			return exportKey;
		});
	}
	
	/*
	 * Hashs data and salt with SHA512, returns as Promise
	 * 
	 * data: buffer
	 * salt: buffer
	 */
	CryptoStorage.prototype.sha512 = function(data, salt) {
        "use strict";
		var str = arrayBufferToString(data)+arrayBufferToString(salt);
		return sha512(str);
	}
	
	/*
	 * Returns Promise of a SHA512 hashed string
	 */
    function sha512(str) {
        "use strict";
        var buffer = stringToArrayBuffer(str);
        return crypto.subtle.digest("SHA-512", buffer).then(function (hash) {
            return arrayBufferToString(hash);
        });
    }
	
	window.CryptoStorage = CryptoStorage;
}());