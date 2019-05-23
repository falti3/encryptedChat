;(function (){
	"use strict";

	/*
	 * Main part of the chat
	 */
	
	/*
	* Constructor
	*/
	function Chat () {
		"use strict";
		this.transport = new Transport(this);
		this.cryptoStorage = new CryptoStorage(this);
		this.chatNotifications = new ChatNotifications();
		
		this.userObject = {};
		this.chats = {};
	};

	/*
	* Login
	* tries to login a user with a given username and passphrase
	* 
	* username: string
	* passphrase: string
	*/
	Chat.prototype.login = function(username, passphrase) {
		"use strict";
		return this.cryptoStorage.login(username, passphrase);
	}
	
	/*
	 * Sets the userobjekt 
	 * userObject {
	 * 		id: int
	 *      name: string
	 * }
	 */
	Chat.prototype.setUserObject = function (userObject) {
		"use strict";
		this.userObject = userObject;
		this.chatNotifications.setUserId(userObject.id);
	}
	
	/*
	* sends a message after encrypting it
	* 
	* messageText: string (plaintext message)
	*/
	Chat.prototype.sendMessage = function(messageText) {
		"use strict";
		this.cryptoStorage.encryptMessage(messageText).then(function (encryptedObject) {
			this.transport.sendMessage(this.cryptoStorage.chatId, arrayBufferToString(encryptedObject.ciphertext), arrayBufferToString(encryptedObject.iv), encryptedObject.keyId);
		}.bind(this));
	}
	
	/*
	 * Callback, when the server sends the contents of a chat (keys, messages, system messages)
	 *
	 * keys: json-list of chat keys
	 * messages: json-list of messages
	 * systemMessages: json-list of system messages 
	 */
	Chat.prototype.getChatContentsCallback = function (keys, messages, systemMessages) {
		"use strict";
		var messagesList = [];
		var systemMessagesList = [];
		for (var key in messages) {
			if (messages.hasOwnProperty(key)) {
				messagesList.push(messages[key]);
			}
		}
		for (var key in systemMessages) {
			if (systemMessages.hasOwnProperty(key)) {
				systemMessagesList.push(systemMessages[key]);
			}
		}
		
		this.cryptoStorage.putChatKeys(keys).then(function () {
			this.handleMessages(messagesList);
			this.handleSystemMessages(systemMessagesList);
		}.bind(this));
	}
	
	/*
	 * Handles a list of messages, 1) decrypts 2) forwards to output if from current chat
	 * 3) forwards list for message counter
	 * 
	 * messages: json-list of messages
	 */
	Chat.prototype.handleMessages = function (messages) {
		"use strict";
		var messagesByChat = {};
		for (var i=0; i<messages.length; i++) {
			if (messagesByChat[messages[i].chatId] == null) {
				messagesByChat[messages[i].chatId] = [messages[i]];
			} else {
				messagesByChat[messages[i].chatId].push(messages[i]);
			}
		}
		if (messagesByChat[this.cryptoStorage.chatId] != null) {
			this.cryptoStorage.decryptMessages(messagesByChat[this.cryptoStorage.chatId]).then(function (decrypted) {
				this.chatNotifications.appendMessages(decrypted);
			}.bind(this));
		}
		this.handleMessagesCounter(messagesByChat);
	}
	
	/*
	 * Manages message counter for chats, increments it for all but current chat
	 *
	 * messages: json-list of new messages
	 */
	Chat.prototype.handleMessagesCounter = function (messages) {
		"use strict";
		for (var key in messages) {
			if (messages.hasOwnProperty(key) && key != this.cryptoStorage.chatId) {
				for (var i=0; i<messages[key].length; i++) {
					var msg = messages[key][i];
					if (this.chats[msg.chatId] == null) {
						this.chats[msg.chatId] = {messageCount: 1};
					} else if (this.chats[msg.chatId].messageCount == null) {
						this.chats[msg.chatId].messageCount = 1;
					} else {
						this.chats[msg.chatId].messageCount++;
					}
				}
			}
		}
		
		this.chatNotifications.updateUnreadMessageCount(this.chats, this.cryptoStorage.chatId);
	}
	
	/*
	 * Handles list of system messages, 1) decrypts them 2) makes stack 3) forwards to function that checks if every message is valid
	 *
	 * messages: json-list of new system messages
	 */
	Chat.prototype.handleSystemMessages = function (messages) {
		"use strict";
		this.cryptoStorage.decryptMessages(messages).then(function (decryptedSystemMessages) {
			var messagesList = [];
			for (var i=0; i<decryptedSystemMessages.length; i++) {
				if (decryptedSystemMessages[i].plaintext != "") {
					var parsedPlaintext = JSON.parse(decryptedSystemMessages[i].plaintext);
					decryptedSystemMessages[i].parsedPlaintext = parsedPlaintext;
					messagesList.push(decryptedSystemMessages[i]);
				}
			}
			messagesList.reverse();
			this.handleNewSystemMessages(messagesList);
		}.bind(this));
	}
	
	/*
	 * Checks system messages, if keys and list of participants are matching with the server version
	 * 
	 * messages: json-list of system messages
	 */
	Chat.prototype.handleNewSystemMessages = function (messages) {
		"use strict";
		var foundLeft = false;
		var foundReKey = false;
		var foundChangedParticipants = false;
		var leftChannel = [];
		for (var i=0; i<messages.length; i++) {
			if (foundLeft && foundReKey && foundChangedParticipants) {
				return;
			}
			switch (messages[i].parsedPlaintext.text) {
				case "changedParticipants":
					if (!foundChangedParticipants) {
						foundChangedParticipants = true;
						var users = messages[i].parsedPlaintext.users;
						var foundUsers = [];
						for (var j=0; j<users.length; j++) {
							if (foundUsers.indexOf(users[j]) == -1 && leftChannel.indexOf(users[j]) == -1 && users[j] != this.userObject.id) {
								foundUsers.push(users[j]);
							}
						}
						var participants = [];
						for (var j=0; j<this.chats[this.cryptoStorage.chatId].participants.length; j++) {
							if (this.chats[this.cryptoStorage.chatId].participants[j].id != this.userObject.id) {
								participants.push(this.chats[this.cryptoStorage.chatId].participants[j]);
							}
						}
						
						if (foundUsers != null && foundUsers.length > 0) {
							if (foundUsers.length != participants.length) {
								throw "Fehlerhafte Nutzerliste!";
							} 
							for (var j=0; j<foundUsers.length; j++) {
								var found = false;
								for (var k=0; k<participants.length; k++) {
									if (foundUsers[j] == participants[k].id) {
										found = true;
									}
								}
								if (!found) {
									throw "Fehlerhafte Nutzerliste!";
								}
							}
						}
					}
					break;
				case "leftChannel":
					if (!foundLeft && !foundReKey) {
						foundLeft = true;
						if (this.cryptoStorage.temp == null) {
							this.cryptoStorage.temp = {};
						}
						if (leftChannel.indexOf(messages[i].parsedPlaintext.senderId) == -1) {
							leftChannel.push(messages[i].parsedPlaintext.senderId);
						}
						this.cryptoStorage.temp.redistributeKey = true;
						this.distributeKey(this.cryptoStorage.chatId);
					}
					break;
				case "changedKey": {
					foundLeft = true;
					foundReKey = true;
					break;
				}
			}
		}
	}
	
	/*
	 * Takes Id of a chat and prepares everything to change to the new chat room
	 * 
	 * chatId: int Id of chatroom that is entered
	 */
	Chat.prototype.openChat = function(chatId) {
		"use strict";
		this.chatNotifications.clearChat();
		this.transport.getChatContents(chatId, 50);
		this.cryptoStorage.chatId = chatId;
		if (chatId == null || chatId == -1) {
			return;
		}
		this.chats[chatId].messageCount = 0;
		
		this.chatNotifications.clearUsers();
		this.chatNotifications.clearMessageCount(chatId);
		this.chatNotifications.removeActiveClasses();
		this.chatNotifications.updateActiveChatClass(this.chats[chatId]);
		this.chatNotifications.updateUserNames(this.chats[chatId].participants, this.userObject);
		this.chatNotifications.redrawParticipants(this.userObject.id, this.chats[this.cryptoStorage.chatId].participants);
	}
	
	/*
	 * Removes a participant from the current room
	 * 
	 * participantId: int Id of participant
	 */
	Chat.prototype.removeParticipant = function (participantId) {
		"use strict";
		var oldParticipants = this.chats[this.cryptoStorage.chatId].participants;
		oldParticipants.push({id: this.userObject.id});
		var newParticipants = [];
		for (var i=0; i<oldParticipants.length; i++) {
			if (oldParticipants[i].id != participantId) {
				newParticipants.push(oldParticipants[i].id);
			}
		}
		if (this.cryptoStorage.temp == null) {
			this.cryptoStorage.temp = {};
		}
		this.cryptoStorage.temp.changedParticipants = true;
		this.cryptoStorage.temp.users = [];
		for (var i=0; i<newParticipants.length; i++) {
			if (newParticipants[i] != this.userObject.id) {
				this.cryptoStorage.temp.users.push(newParticipants[i]);
			}
		}
		if (participantId != this.userObject.id) {
			this.transport.postChatParticipants(this.cryptoStorage.chatId, newParticipants);
		} else {
			this.cryptoStorage.encryptMessage({text: "leftChannel", senderId: this.userObject.id}).then(function (encryptedMessage) {
				this.transport.sendSystemMessage(this.cryptoStorage.chatId, arrayBufferToString(encryptedMessage.ciphertext), arrayBufferToString(encryptedMessage.iv), encryptedMessage.keyId);
				this.transport.postChatParticipants(this.cryptoStorage.chatId, newParticipants);
				this.removeChatCallback(this.cryptoStorage.chatId);
			}.bind(this));
		}
	}
	
	/*
	 * Adds a participant to the current chat
	 * 
	 * participantId: int Id of participant
	 */
	Chat.prototype.addParticipant = function (participantId) {
		"use strict";
		var oldParticipants = this.chats[this.cryptoStorage.chatId].participants;
		oldParticipants.push({id: this.userObject.id});
		var newParticipants = [];
		var found = false;
		for (var i=0; i<oldParticipants.length; i++) {
			newParticipants.push(oldParticipants[i].id);
			if (oldParticipants[i].id == participantId) {
				found = true;
			}
		}
		if (!found) {
			newParticipants.push(participantId);
			if (this.cryptoStorage.temp == null) {
				this.cryptoStorage.temp = {};
			}
			this.cryptoStorage.temp.users = [];
			for (var i=0; i<newParticipants.length; i++) {
				if (newParticipants[i].id != this.userObject.id) {
					this.cryptoStorage.temp.users.push(newParticipants[i]);
				}
			}
			this.cryptoStorage.temp.changedParticipants = true;
			this.transport.postChatParticipants(this.cryptoStorage.chatId, newParticipants);
		}
	}
	
	/*
	 * Callback, when server sends new list of participants
	 *
	 * chats: json-list of all chats of the current user
	 */
	Chat.prototype.getChatsCallback = function (chats) {
		"use strict";
		chats.forEach(function (chat) {
			var newChat = this.importChat(chat);
			if (this.chats[chat.id] == null) {
				this.chats[chat.id] = newChat;
				this.chatNotifications.appendNewChat(newChat);
			} else {
				newChat.messageCount = this.chats[chat.id].messageCount;
				this.chats[chat.id] = newChat;
				if (this.cryptoStorage.chatId == chat.id) {
					this.openChat(chat.id);
				}
			}
		}.bind(this));
	}
	
	/*
	 * handles new chat with keys and participants
	 * 
	 * chat: json-object of chat
	 */
	Chat.prototype.importChat = function (chat) {
		"use strict";
		var newChat = {id: chat.id, name: chat.name, participants: []};
		chat.participants.forEach(function (participant) {
			newChat.participants.push({id: participant.id, name:participant.name});
			var publicKey = {id: participant.id, publicKey: participant.publicKey};
			this.cryptoStorage.importPublicKey(publicKey);
		}.bind(this));
		return newChat;
	}
	
	/*
	 * Removes a chat from the list of chats, whenn the server has sent a message that this chat is removed
	 * 
	 * chatId: int Id of chatroom
	 */
	Chat.prototype.removeChatCallback = function (chatId) {
		"use strict";
		var chats = {};
		var highestId = -1;
		for (var key in this.chats) {
			if (this.chats.hasOwnProperty(key)) {
				if (key != chatId) {
					if (parseInt(key) > parseInt(highestId)) {
						highestId = key;
					}
					chats[key] = this.chats[key];
				}
			}
		}
		this.chats = chats;
		this.chatNotifications.removeChat(chatId);
		
		if (this.cryptoStorage.chatId == chatId) {
			this.openChat(highestId);
		}
	}
	
	/*
	 * Deletes a chat
	 * 
	 * chatid: int Id of chats to be deleted
	 */
	Chat.prototype.deleteChat = function (chatId) {
		"use strict";
		this.transport.deleteChat(chatId);
	}
	
	/*
	 * Creates a new user account with name and passphrase
	 * Creates salts, passwords and keys and sends it to the server
	 * 
	 * username: string
	 * passphrase: string
	 */
	Chat.prototype.createAccount = function (username, passphrase) {
		"use strict";
		var passwordSalt = this.cryptoStorage.generateRandomArray(256);
		var keySalt = this.cryptoStorage.generateRandomArray(256);
		Promise.all([
			this.cryptoStorage.sha512(passphrase, passwordSalt), 
			this.cryptoStorage.deriveKey(passphrase, keySalt),
			this.cryptoStorage.generateKeys()
			]).then(function (result) {
				this.cryptoStorage.exportKey(result[2].publicKey).then(function (publicKey) {
					this.transport.createAccount(username, result[0], arrayBufferToString(passwordSalt), arrayBufferToString(keySalt), publicKey);
					if (this.cryptoStorage.temp == null) {
						this.cryptoStorage.temp = {};
					}
					this.cryptoStorage.temp.userName = username;
					this.cryptoStorage.put("aesKey", result[1]);
					this.cryptoStorage.put("privateKey", result[2].privateKey);
				}.bind(this));
		}.bind(this));
	}
	
	/*
	 * Callback, when account is created, sends storage to the server
	 * 
	 * id: int new userId
	 */
	Chat.prototype.createAccountCallback = function (id) {
		"use strict";
		this.userObject = {id: id, name: this.cryptoStorage.temp.userName};
		this.cryptoStorage.userObject = this.userObject;
		this.cryptoStorage.store();
	}
	
	/*
	 * Callback, when server has created a new chat
	 * 
	 * chatId: int Id of new chat
	 * chatKeyId: int Id of chat key
	 */
	Chat.prototype.createChatCallback = function (chatId, chatKeyId) {
		"use strict";
		this.cryptoStorage.chatId = chatId;
		if (this.cryptoStorage.temp == null) {
			return;
		}
		if (this.cryptoStorage.temp.chatKeyId == null) {
			this.cryptoStorage.temp.chatKeyId = {};
		}
		this.distributeKey(chatId, chatKeyId);
	}
	
	/*
	 * Distributes new chat key with given key id to the participants (after encrypting it)
	 * 
	 * chatId: int Id of chat
	 * chatKeyId: int Id of key
	 */
	Chat.prototype.distributeKey = function (chatId, chatKeyId) {
		"use strict";
		if (chatKeyId == null) {
			return this.transport.createKey(chatId);
		}
		
		if (this.cryptoStorage.temp == null) {
			this.cryptoStorage.temp = {
					chatKeyId: {}
			};
		}
		if (this.cryptoStorage.temp.chatKeyId == null) {
			this.cryptoStorage.temp.chatKeyId = {};
		}
	
		this.cryptoStorage.temp.chatKeyId[chatId] = chatKeyId;
		this.cryptoStorage.generateKey().then(function (chatKey) { 
			this.cryptoStorage.exportKey(chatKey).then(function (exportChatKey) { 
				this.cryptoStorage.putChatKey(exportChatKey, chatKeyId, chatId).then(function (chatKey) {
					this.encryptChatKeyForParticipants(chatId);
				}.bind(this));
			}.bind(this));
		}.bind(this));
	}
	
	/*
	 * Encrypts a chat key for the participants of this chat, beforehand collects all public keys of the participants
	 * 
	 * chatId: int Id of chat room
	 */
	Chat.prototype.encryptChatKeyForParticipants = function (chatId) {
		"use strict";
		var users = this.cryptoStorage.temp.users;
		if (users == null || (users.length <= 1 && this.chats[chatId] != null && this.chats[chatId].participants != null)) {
			var participants = this.chats[chatId].participants;
			if (participants == null) {
				return;
			}
			users = [];
			for (var i=0; i<participants.length; i++) {
				users.push(participants[i].id);
			}
		}
		
		var pk = this.cryptoStorage.getPublicKeys(users);
		this.cryptoStorage.temp.users = [];
		if (pk != null) {
			this.encryptChatKeyWithPublicKeys(pk);
		}
	}
	
	/*
	 * Encrypts a chat key with a list of public keys
	 * 
	 * publicKeys: json-list of public keys
	 */
	Chat.prototype.encryptChatKeyWithPublicKeys = function (publicKeys) {
		"use strict";
		var chatKeyId = this.cryptoStorage.temp.chatKeyId[this.cryptoStorage.chatId];
		if (chatKeyId == null) {
			return;
		}
		var encrypted = [];
		var chatKey = this.cryptoStorage.getChatKey(chatKeyId, this.cryptoStorage.chatId);
		if (chatKey == null) {
			return;
		}
		
		var ownKey = this.cryptoStorage.getPublicKey();
		publicKeys.push(ownKey);
		if (this.cryptoStorage.temp != null && this.cryptoStorage.temp.keys != null && this.cryptoStorage.temp.keys[chatKeyId] != null) {
			for (var i=0; i<this.cryptoStorage.temp.keys[chatKeyId].length; i++) {
				publicKeys.push(this.cryptoStorage.temp.keys[chatKeyId][i]);
			}
		}
		
		this.cryptoStorage.exportKey(chatKey.key).then(function (exportChatKey) {
			publicKeys.forEach(function (publicKeyIdPair) {
				encrypted.push(this.cryptoStorage.encryptWithPublicKey(JSON.stringify(exportChatKey), publicKeyIdPair.key, publicKeyIdPair.id));
			}.bind(this));
			
			Promise.all(encrypted).then(function (encryptedChatKeys) {
				var userIds = [];
				encryptedChatKeys.forEach(function (encryptedChatKey){
					this.transport.sendChatKey(arrayBufferToString(encryptedChatKey.ciphertext), arrayBufferToString(encryptedChatKey.iv), encryptedChatKey.userId, chatKeyId);
					userIds.push(encryptedChatKey.userId);
				}.bind(this));
				var userIdsClean = [];
				for (var i=0; i<userIds.length; i++) {
					if (userIdsClean.indexOf(userIds[i]) == -1) {
						userIdsClean.push(userIds[i]);
					}
				}
				if (this.cryptoStorage.temp.createChat) {
					this.cryptoStorage.encryptMessage({text: "changedParticipants", senderId: this.userObject.id, users: userIdsClean}).then(function (encryptedMessage) {
						this.transport.sendSystemMessage(this.cryptoStorage.chatId, arrayBufferToString(encryptedMessage.ciphertext), arrayBufferToString(encryptedMessage.iv), encryptedMessage.keyId);
						this.transport.postChatParticipants(this.cryptoStorage.chatId, userIdsClean);
						this.cryptoStorage.clearTemp();
					}.bind(this));
				} else if (!this.cryptoStorage.temp.redistributeKey) {
					this.cryptoStorage.encryptMessage({text: "changedParticipants", senderId: this.userObject.id, users: userIdsClean}).then(function (encryptedMessage) {
						this.transport.sendSystemMessage(this.cryptoStorage.chatId, arrayBufferToString(encryptedMessage.ciphertext), arrayBufferToString(encryptedMessage.iv), encryptedMessage.keyId);
						this.cryptoStorage.clearTemp();
					}.bind(this));
				} else {
					this.cryptoStorage.temp.redistributeKey = false;
					this.cryptoStorage.encryptMessage({text: "changedKey", senderId: this.userObject.id, users: userIdsClean}).then(function (encryptedMessage) {
						this.transport.sendSystemMessage(this.cryptoStorage.chatId, arrayBufferToString(encryptedMessage.ciphertext), arrayBufferToString(encryptedMessage.iv), encryptedMessage.keyId);
						this.cryptoStorage.clearTemp();
					}.bind(this));
				}
			}.bind(this));
		}.bind(this));
	}
	
	/*
	 * Creates a new chatroom with a name and a list of participant ids
	 * 
	 * userIds: json-list of Ids
	 * name: Name of Chatroom
	 */
	Chat.prototype.createChatSession = function (userIds, name) {
		"use strict";
		if (!(userIds instanceof Array)) {
			throw "Kein Array übergeben!";
		}
		var users = [];
		userIds.forEach(function (i) {
			if (Number.isInteger(Number.parseInt(i))) {
				users.push(i);
			}
		});
		if (this.cryptoStorage.temp == null) {
			this.cryptoStorage.temp = {
					createChat: true,
					users: []};
		}
		this.cryptoStorage.temp.users = users;
		this.cryptoStorage.temp.createChat = true;
		this.transport.createChat(name);
	}
	
	window.Chat = Chat;
}());