;(function (){
	"use strict";

	/*
	 * For the transmission of messages to the server and handling of messages from the server
	 */
	
	/*
	* constructor
	*/
	function Transport (chat) {
		this.chat = chat;
		this.socketTypes = {
			error: "error",
			createAccount: "createAccount",
			storeStorage: "storeStorage",
			getSalt: "getSalt",
			login: "login",
			createChat: "createChat",
			createChatKey: "createChatKey",
			postPersonalChatKey: "postPersonalChatKey",
			postSystemMessage: "postSystemMessage",
			getPublicKeys: "getPublicKeys",
			getChats: "getChats",
			getChatContents: "getChatContents",
			postChatParticipants: "postChatParticipants",
			postMessage: "postMessage",
			chatMessages: "chatMessages",
			systemMessages: "systemMessages",
			chatParticipants: "chatParticipants",
			getPersonalChatKey: "getPersonalChatKey",
			removedFromChat: "removedFromChat",
			deleteChat: "deleteChat"
		};

		/*
		 * connection to the Websocket...
		 */
		this.socket = new WebSocket("ws://localhost:8080/ws");
		this.socket.onmessage = this.handleSocketMessage.bind(this);
		this.socket.onopen = this.socketOpen;
		this.socket.onerror  = this.socketError;
		this.socket.onclose  = this.socketClose;
	};
	
	/*
	 * Handles SocketOpen event
	 */
	Transport.prototype.socketOpen = function (event) {
		"use strict";
		console.log("Socket geöffnet");
	}
	
	/*
	 * Handles SocketError event
	 */
	Transport.prototype.socketError = function (event) {
		"use strict";
		this.socketClose(event);
		throw event;
	}
	
	/*
	 * Handles SocketClose event, clears cryptoStorage
	 */
	Transport.prototype.socketClose = function (event) {
		"use strict";
		console.log("clear all userdata");
		this.chat.cryptoStorage.clear();
	}
	
	/*
	 * Handles messages from Server
	 * 
	 * event: event
	 */
	Transport.prototype.handleSocketMessage = function (event) {
		"use strict";
		var data = JSON.parse(event.data);
		switch (data.type) {
			case this.socketTypes.createAccount:
				/*
				 * data = {
				 *  id: 6,
				 *  type: "createAccount"
				 * }
				 */
				return this.chat.createAccountCallback(data.id);
			case this.socketTypes.getSalt:
				/*
				 * data = {
				 * 	salt: "^5¦!'ê ûBâ~¶³N¯PwWï"Z®úvçÒu¼HyË­o^¡…+|¦°´Ä"ø~,¤ã¡zÑ?qJ°=FåïgO~'T®xëD¥`À á4~Y", 
				 *	type: "getSalt"
				 * }
				 */
				return this.chat.cryptoStorage.getSaltCallback(data.salt);
			case this.socketTypes.login:
				/*
				 * data = {
				 *  id: 4,
				 *  keySalt: "ç¤L°ã~©Ôø9+øÙ\½¸Ã´¹­>lá¹¨áþßÀá\çGu¨Òµf~má/-³)¸wÂÁVAN÷´¥ihÅvxe>¸Lô´áôrò¬1q ýrYè@^³ô*È$Õ=ÈÂvnYØ↵OT{jÛñÇA<vÐþS}",
				 *  name: "user1",
				 *  publicKey: "{"alg":"RSA-OAEP-512","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"j96tRTIl27ekeSbzRgI96EV3J6Uc7Bt-5djy"}",
				 *  salt: "£û79z>®¯7O",
				 *  storage: "õß{TâùÎ.d®]%zèqÅðüòo4%Ö÷û6&e>ÌÃìM})!Ë¯U«Õ[±&Câ§`Å`ÐÑZ\±Çr$sU",
				 *  type: "login", 
				 *  updateTime: "2018-02-19 13:17:24"
				 * }
				 */
				if (data.id == null) {
					throw "user not logged in";
				}
				return this.chat.cryptoStorage.loginCallback({id: data.id, keySalt: data.keySalt, name: data.name, publicKey: data.publicKey, updateTime: data.updateTime, storage: data.storage, salt: data.salt});
			case this.socketTypes.createChat:
				/*
				 * data = {
				 *  chatId: 2, 
				 *  chatKeyId: 4,
				 *  type: "createChat"
				 * }
				 */
				return this.chat.createChatCallback(data.chatId, data.chatKeyId);
			case this.socketTypes.createChatKey:
				/*
				 * data = {
				 *  chatId: 18,
				 *  id: 21,
				 *  type: "createChatKey"
				 * }
				 */
				return this.chat.distributeKey(data.chatId, data.id)
			case this.socketTypes.getChatContents:
				/*
				 * data = {
				 *  keys: "{"0":{"personalChatKeyId":28,"chatKeyId":18,"chatId":16,"chatKey":"\u0016\u00db\r<D\u001a\u0086\u00d1,-\u00af\u00df\u0097\u00fc.\u0092t\u00c5,\u00f2\u00ea OA\u0090\u0015y^\u00fdYp\u00bcU\u00ec\u0090\u00f21\u00bb\u00c68\u00f7[+fqT\u00ec\u00dd\u008c\u0018W\u0095\u00b4\u00d1JkK\u00e6\u0081\\\u00f9\u00eaKv\u0080Q9\u00b3\u00a2\u00e1\u00920\u00dc\u00ec6\u00d2\u008clv\u0019)\u00bd\u00cb\b\u00ee\u00c4\u0087\u00fc\u00d8B\u00a8\u00f5\f{\u00f2\u0003\u0011\u00db\u00dfjX\u0099O\u00a4\u00f6\u00f5\u00fe\u00bf3\u00c8~\u00dd\u0005\u00c4\u0001\tlB\u001f!\f\u00d3.m\u0088\u0083@}\u0002\u0001\u00a8\u00bb\u00ae\u008f\u00f88\r\u00f4\u0016\u00db\u00c3\u0018\u00b5:B\u0012,\u00e1\u000fT\u00bc\u0099\u0018{\u00e0E\u00e4\u00daO\u0087\u00a4[L\u00b0\u00cf+\u000f\u0014<\u009e\u00f1\u00e3:=\u00f9\u00e1\u00f6ZJ\u00af\u0004Y\\p+Z\u00cfq\u0087\u00a4j\u0097c\u0096\u00fcs\u00df\u00a83\u00ac\u00c1\u0088\u00d0R\u00caQ\u00ab\u0085\u00ee\u00e1\u00d0\u00d4\u00d3 S94\u0004\u00dc{O\u00a8v@\u00a9_\u00f8@d\\-\u0093\u009c\u00a6\u00fdx\u00f6\u00fc\/t\u00fb<?\u00a6\u008e\u00a7\u00d2\u00d08D|#rN\u0014\t","salt":"\u00fe\u0015XD\u0016\u0005\r\u0010\u0012\u009b0\u00b5\u00a1\u00b8o\u0088"},"type":"getPersonalChatKeys"}",
				 *  messages: "{"0":{"id":8,"content":"l\u00d3\b<\u00dd\u00ff\u00c0\u00f6H\u00e5'\u0090\u009f\r\u0010{","salt":"H\u00c4\u00b3\u0084N=q\u0099\u00fa\u008fus\u00905E\u00bf","time":"2018-02-21 11:48:33","chatId":16,"chatKeyId":18,"senderId":4},"1":{"id":9,"content":"\u009c\u00e0\u00b0\u00dc?\u0004qa\u00ea\u00b7\u00c9\u009fFy\u00b8]","salt":"\u0002}\u00a7\u0011\u00ad{}\u00dfTku8\u00a7\u00f4\u00c27","time":"2018-02-21 11:48:49","chatId":16,"chatKeyId":18,"senderId":4},"2":{"id":10,"content":"\u00ad\t\u00ef)\u0099\u0014\u0003s\u0018\u00159P\u00b2\u00ea\u00e0\u0097\nV\u00e3\u00bc\u00cc\u009b\u000f\u00c6!\u0019k\u0016\u00a2\u0097o\u0019iN\u00a5\u00b8\u0011Qs:\u00d5B\u00d3\r\u001cjx\u00bdaIF#\u0010Q4\u0085\u00bf\u00c3\u008cp\u00ed\u0086\u00b2\r\u00d9\u000b+\u00cf\u0098\u00ae9\u0084\u00b5'b\u0010&la\u00af\u00d4d\u00a8\u000f,\u00fb\u009c9\u001c\u00d1\u008f\u0089\u00dc\u00078U\u00e9{\u009a\u00c1\u00c9@\r6\u0006\u0016Y\u00be\u00a2\u00aa\u00f9(\u00e1\u001e\u00133G\u0007\u0016\u00fcP\u00ff\u00c0*\u001f\u00ea\u00c9\u0089E\u0083\u008c\u0087\u0004\u0004\u0016\u00c2\u0017\u00baP\u00e6\u00c82\u00be?\u00ff\u0098;)\u00eb\fm\u009f\u001f\u0004\u00d3\u00a0\u0097\u00ffA\u00b7%b\u0011!N\u00f3\u00c1\u00d1\u0016\u00b0\u00cc\u00fc\u00d8\u00b4\u00e8\u009d0\u00d5_zK?&u\u00fa\u0080$\u00fen\u00f2\u00adt\u00ee\u00eex\u00a4\u0098\u0002\u0083D\u00a4\u001e\u00e0\u00a1i\u00a5\u001a\u0088\u00fc\u00d2\u00af\u00ff7\/\u00f5@m\u001f\u0002%I,\u001f\u0093q\u00a5\u0006\u00c9\u00ed\u00ff\u00c9\u00a1\u00cf&\u00ca7\u000f\u0081n\u00e3\u0002DK\u00e8\b\u00d0\u0004\u008d\u00d1\u00d25\u001fu:\u008d\u00b7\u00e0\u00be\u00c1ZW\u00a2\u0087\u0005c\u009c\u0085\u00ab\u00c6,\u00db\u00f6\u00f1\u00fd\u00e1\u00ce]So\u00f6\u0013\u009a'\u00986\u0006\u0089\u000e\u009eh\u00afy\u00b9\u00e0\u00e7)\u00c3P\u0098m\u00f8*\u000fy\u00b1\u00bf,\u0088O\u00d2-\u00a8\u0088\u0091\u00bb\u00f9\u00bd}\u00af\u00d3\u0015\u0096\u00a1\u00a5b$\u00c8\u000e\u0000:j\u00aci\u0085jv\u00a7\u001e\u00eb^c\u00ef\u00fbm\\\u00fd\u0088\u0091]d\u00ae|:\u0092\u00fb\u00ac\u00dd\u00a7h\u0099l\u00fa\u00c8\u00d6\u00d3\u009d\u0002\u009cK\u0088I\u0017\\`#\u00af\\\u0012\u009c*\u00f19\u00c28ET#\u00f2\u00f3\u0082\u00bb\u00a7\u00de \u00d9\u00b1\u00a8\u00f8\u001e\u00e1\u0083\u00b8\u00ea\u008f\u00d9\u00e9\u0011\u00faJm\u0011\u0098c\u00a1\u0092\u001eeW\u00ff\u00fe\u00f5Bb0\u00a8\u00b6\u00d1\u00caoL\u00b78\u00fa\u00eavN\u00b98\u0010g\u00c4x\u008chc\u00b0\u00f5\u000b\u0085\u00d7Pd\u001dl!\u00d7\u008a\u00b0\u00eb\u00a9Mn'\u0005\u00f9V\u008d\u0007\u008c\u00b6\u00e4As\u00f9\u009b\u0086\u00c0\u00cc\u00e7+\u0015\u00e9\u00af-\u00c1\u00d5\u00ea#N\u00ea\u00d0+\u00c8\u001c\u0016\u008co\u0091\u0005\u00b3\u00fd\u00c7\u0095;\u00d5\u0000\u0089\u00b1\u00d9\/Ck\u00ae\u0012\u00a0N\u00ad\u00bbi\u008d\u00e5\u00a8\u00b9Q\u0013e\u00d1\u001cE\u00d2\u00ed+\u008e\u00d6Wu\u00c4TgS*\u00f4\u0006\u001e\u0016\u00a1J*W\u00b8\u00f0\u0091\u0083#c\u00b6\u00be\u00d21\u00dc2\u00e4\u00f4\u00afI\u0007fLu=\u00c9\u0010Fy\u0010'Y\u00b8nP\u00f3\u00cb\u00e1\f\u00ec?\u00f0n\u00e2\u00fd\u0000","salt":"W\u00fa3\u0097^J\u0087?\u0006|8\u00fc6\u0094YP","time":"2018-02-21 11:49:44","chatId":16,"chatKeyId":18,"senderId":4},"type":"chatMessages"}",
				 *  systemMessages: "{"0":{"id":9,"content":"","salt":"","time":"2018-02-20 16:12:51","chatId":16,"chatKeyId":18},"type":"systemMessages"}",
				 *  type: "getChatContents"
				 * }
				 */
				var keys = JSON.parse(data.keys);
				var messages = JSON.parse(data.messages);
				var systemMessages = JSON.parse(data.systemMessages);
				var keysList = [];
				for(var key in keys) {
					if (keys.hasOwnProperty(key) && key != "type") {
						keysList.push(keys[key]);
					}
				}
				var messagesList = [];
				for(var key in messages) {
					if (messages.hasOwnProperty(key) && key != "type") {
						messagesList.push(messages[key]);
					}
				}
				var systemMessagesList = [];
				for(var key in systemMessages) {
					if (systemMessages.hasOwnProperty(key) && key != "type") {
						systemMessagesList.push(systemMessages[key]);
					}
				}
				return this.chat.getChatContentsCallback(keysList, messagesList, systemMessagesList);
			case this.socketTypes.getChats:
				/*
				 * data = {
				 *  0: {
				 *   id: 15,
				 *   name: "Chatroom1",
				 *   participants: [
				 *    {
				 *     id: 2,
				 *     name: "Bob",
				 *     publicKey: "{"alg":"RSA-OAEP-512","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"tQThzEemM8mTFYL-AATbauoLnwZHaGF4w6_s_FIJdTGaNNHqpOw"}" 
				 *    },
				 *    {
				 *     id: 3,
				 *     name: "Charlie",
				 *     publicKey: "{"alg":"RSA-OAEP-512","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"yux8Ql0TJRLdUNbYUskE7YAveyIognvFCawuX3nu4UGqP7VP97Q"}"
				 *    }
				 *   ]
				 *  1: {
				 *   id: 16,
				 *   name: Chatroom2",
				 *   participants: [
				 *    {
				 *     id: 2,
				 *     name: "Bob",
				 *     publicKey: "{"alg":"RSA-OAEP-512","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"tQThzEemM8mTFYL-AATbauoLnwZHaGF4w6_s_FIJdTGaNNHqpOw"}" 
				 *    },
				 *    {
				 *     id: 3,
				 *     name: "Charlie",
				 *     publicKey: "{"alg":"RSA-OAEP-512","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"yux8Ql0TJRLdUNbYUskE7YAveyIognvFCawuX3nu4UGqP7VP97Q"}"
				 *    }
				 *   ]
				 *  }
				 *  type: "getChats"
				 */
				var chats = [];
				for(var key in data) {
					if (data.hasOwnProperty(key) && key != "type") {
						chats.push(data[key]);
					}
				}
				return this.chat.getChatsCallback(chats);
			case this.socketTypes.getPublicKeys:
				/*
				 * data = {
				 *  type: "getPublicKeys",
				 *  keys: [
				 *   "{"id":2,"publicKey":"{\"alg\":\"RSA-OAEP-512\",\"e\":\"AQAB\",\"ext\":true,\"key_ops\":[\"encrypt\"],\"kty\":\"RSA\",\"n\":\"tQThzEemkhGZE0RLJM9E1R9Qw2b5jb947UqTUJY_s_FIJdTGaNNHqpOw\"}","type":""}",
				 *   "{"id":3,"publicKey":"{\"alg\":\"RSA-OAEP-512\",\"e\":\"AQAB\",\"ext\":true,\"key_ops\":[\"encrypt\"],\"kty\":\"RSA\",\"n\":\"yux8Ql0TJRLdUNbYUskE7YAveyIognvFSdMM2jIJsQo5u4UGqP7VP97Q\"}","type":""}"
				 *  ]
				 * }
				 */
				var keyPairs = [];
				if (data.keys != null) {
					for (var i=0; i<data.keys.length; i++) {
						keyPairs.push(JSON.parse(data.keys[i]));
					}
				}
				return this.chat.cryptoStorage.importPublicKeys(keyPairs).then(function (keyPairs) {
					return this.chat.encryptChatKeyWithPublicKeys(keyPairs);
				}.bind(this));
			case this.socketTypes.postPersonalChatKey:
				/*
				 * data = {
				 *  id: 23,
				 *  type: "postPersonalChatKey"
				 * }
				 */
				return;
			case this.socketTypes.postChatParticipants:
				/*
				 * data = {
				 *  type: "postChatParticipants"
				 * }
				 */
				if (this.chat.cryptoStorage.temp != null && this.chat.cryptoStorage.temp.changedParticipants) {
					this.chat.distributeKey(this.chat.cryptoStorage.chatId);
				}
				return;
			case this.socketTypes.postMessage:
				/*
				 * data = {
				 *  id: 7,
				 *  type: "postMessage"
				 * } 
				 */
				return;
			case this.socketTypes.chatMessages:
				/*
				 * data = {
				 *  0: {
				 *   chatId: 16,
				 *   chatKeyId: 18,
				 *   content: "à°Ü?qaê·ÉFy¸]",
				 *   id: 9,
				 *   salt: "}§­{}ßTku8§ôÂ7",
				 *   senderId: 4,
				 *   time: "2018-02-21 11:48:49"
				 *  },
				 *  1: {
				 *   chatId: 16,
				 *   chatKeyId: 19,
				 *   content: "­	ï)s9P²êà↵Vã¼ÌÆ!k¢oiN¥¸Qs:±¨øá¸êÙéúJmcÒí+ÖWuÄTgS*ô¡J*W¸ð#c¶¾Ò1Ü2äô¯IfLu=ÉFy'Y¸nPóËáì?ðnâý",
				 *   id: 10,
				 *   salt: "Wú3^J?|8ü6YP",
				 *   senderId: 3,
				 *   time: "2018-02-21 11:49:44"
				 *  },
				 *  type: "chatMessages"
				 * }
				 */
				var messages = [];
				for (var key in data) {
					if (data.hasOwnProperty(key) && key != "type") {
						messages.push(data[key]);
					}
				}
				this.chat.handleMessages(messages);
				return;
			case this.socketTypes.chatParticipants:
				/*
				 * data = {
				 *  0: { 
				 *   id: 16,
				 *   name: "Testroom1",
				 *   participants: [
				 *    {id: 2, name: "Bob", publicKey: "{"alg":"RSA-OAEP-512","e":"AQAB","ext":true,"key_o…miN-5T6lQMkMFxAhN9Pjb947UqTUJY_s_FIJdTGaNNHqpOw"}"},
				 *    {id: 3, name: "Charlie", publicKey: "{"alg":"RSA-OAEP-512","e":"AQAB","ext":true,"key_o…0Q_PaGVpPoNzqTwHugdA3HKMdMM2jIJsQo5u4UGqP7VP97Q"}"},
				 *    {id: 4, name: "Dave", publicKey: "{"alg":"RSA-OAEP-512","e":"AQAB","ext":true,"key_o…3LpLqZpadrfCUCty0k1fFyEEawE-PXKrdCumfkaXuZqcfaw"}"}
				 *   ]
				 *  },
				 *  type: "chatParticipants"
				 * }
				 */
				var chats = [];
				for (var key in data) {
					if (data.hasOwnProperty(key) && key != "type") {
						chats.push(data[key]);
					}
				}
				this.chat.getChatsCallback(chats);
				return;
			case this.socketTypes.getPersonalChatKey: //todo: here chatkey wrong
				/*
				 * data = {
				 *  chatId: 15,
				 *  chatKey: "Ûtû<?¦§ÒÐ8D|#rN	",
				 *  chatKeyId: 17,
				 *  personalChatKeyId: 25,
				 *  salt: "þXD0µ¡¸o",
				 *  type: "getPersonalChatKey"
				 * }
				 */
				this.chat.cryptoStorage.putChatKeys([data]);
				return;
			case this.socketTypes.error:
				/*
				 * data = { 
				 *  error: "missing params", 
				 *  hint: "username", 
				 *  type: "error"
				 * }
				 */
				if (data.hint) {
					console.log(data.hint);
				}
				throw data.error;
			case this.socketTypes.removedFromChat:
				/*
				 * data = {
				 *  chatId: 16,
				 *  type: "removedFromChat"
				 * }
				 */
				return this.chat.removeChatCallback(data.chatId);
			case this.socketTypes.systemMessages:
				/*
				 * data = {
				 *  0: {
				 *   chatId: 18,
				 *   chatKeyId: 21,
				 *   content: "Æ`á<_p¸2[¨4 cH,d&1`dØù~G/×aûâ¸y~I	^Ì;JhzuI=O¿G?ínC?yrhä"
				 *   id: 11,
				 *   salt: "ô¦sºíz¬¬~Ja«",
				 *   time: "2018-02-21 11:42:32"
				 *  },
				 *  1: {
				 *   chatId: 18,
				 *   chatKeyId: 21,
				 *   content: "nC¸2[¨4 cH,d&×aûôGâpG?í~Ja«¸yJhzu1~II=O¿?y	^Ì;`dØù~rhä"
				 *   id: 12,
				 *   salt: "íz¬¬/¦sºÆ`á<_",
				 *   time: "2018-02-21 11:42:33"
				 *  },
				 *  type: "systemMessages"
				 * }
				 */
				var systemMessages = [];
				for (var key in data) {
					if (data.hasOwnProperty(key) && key != "type") {
						systemMessages.push(data[key]);
					}
				}
				return this.chat.handleSystemMessages(systemMessages);
			case this.socketTypes.postSystemMessage:
				/*
				 * data = {
				 *  id: 13,
				 *  type: "postSystemMessage"
				 * }
				 */
				return;
			default:
				console.log("unbekannter typ");
				console.log(data.type);
				return;
		}
	}
	
	/*
	 * Sends message to server for creating a new account with username, password, salt, salt2 and public key
	 * 
	 * username: string
	 * password: string (hashed with passwordSalt)
	 * passwordSalt: string
	 * keySalt: string (salt for Key derivation)
	 * publicKey: string
	 */
	Transport.prototype.createAccount = function (username, password, passwordSalt, keySalt, publicKey) {
		"use strict";
		var sendObject = {
			type: this.socketTypes.createAccount,
			username:username,
			password:password, 
			passwordSalt:passwordSalt, 
			keySalt:keySalt, 
			publicKey:JSON.stringify(publicKey)
		};
		
		this.socket.send(JSON.stringify(sendObject));
	}
	
	/*
	 * sends message to the Server for saving a Storage
	 * 
	 * userId: int Id of current user
	 * storage: blob
	 * salt: string
	 */
	Transport.prototype.storeStorage = function (userId, storage, salt) {
		"use strict";
		var sendObject = {
			type: this.socketTypes.storeStorage,
			userId:userId, 
			storage:storage, 
			salt:salt}
		this.socket.send(JSON.stringify(sendObject));
	}
	
	/*
	 * asks server for Salt to username
	 * 
	 * username: string
	 */
	Transport.prototype.getSalt = function (username) {
		"use strict";
		var sendObject = {
			type: this.socketTypes.getSalt,
			username:username
		}
		this.socket.send(JSON.stringify(sendObject));
	}
	
	/*
	 * Sends message to server if user with username and hased password can be logged in
	 * 
	 * username: string
	 * encryptedPassphrase: string
	 */
	Transport.prototype.login = function (username, encryptedPassphrase) {
		"use strict";
		var sendObject = {
			type: this.socketTypes.login,
			username:username, 
			password:encryptedPassphrase
		};
		this.socket.send(JSON.stringify(sendObject));
	}
	
	/*
	 * Tells the Server to create a new Chat with a given name
	 * 
	 * chatname: string
	 */
	Transport.prototype.createChat = function (chatname) {
		"use strict";
		var sendObject = {
				type: this.socketTypes.createChat,
				chatname:chatname
			};
		this.socket.send(JSON.stringify(sendObject));
	}
	
	/*
	 * Tells the Server to create a new key for the chat in the database
	 * 
	 * chatId: int Id of Chatroom
	 */
	Transport.prototype.createKey = function (chatId) {
		"use strict";
		if (chatId > 0) {
			var sendObject = {
					type: this.socketTypes.createChatKey,
					chatId:chatId
				};
			this.socket.send(JSON.stringify(sendObject));
		}
	}
	
	/*
	 * sends ChatKey to the Server
	 * 
	 * key: string
	 * salt: string
	 * userId: int Id
	 * keyId: int Id
	 */
	Transport.prototype.sendChatKey = function (key, salt, userId, keyId) {
		"use strict";
		var sendObject = {
				type: this.socketTypes.postPersonalChatKey,
				key:key, 
				salt:salt, 
				userId: userId, 
				keyId: keyId
		};
		this.socket.send(JSON.stringify(sendObject));
	}
	
	/*
	 * Sends Message to the Server
	 * 
	 * chatId: int Id
	 * message: string encrypted
	 * salt: string
	 * keyId: int Id
	 */
	Transport.prototype.sendMessage = function (chatId, message, salt, keyId) {
		"use strict";
		var sendObject = {
				type: this.socketTypes.postMessage,
				chatId: chatId, 
				message: message, 
				salt: salt, 
				chatKeyId: keyId
		};
		this.socket.send(JSON.stringify(sendObject));
	}
	
	/*
	 * Sends System message to the Server
	 * 
	 * chatId: int Id
	 * message: string encrypted
	 * salt: string
	 * keyId: int Id
	 */
	Transport.prototype.sendSystemMessage = function (chatId, message, salt, keyId) {
		"use strict";
		var sendObject = {
				type: this.socketTypes.postSystemMessage,
				chatId: chatId, 
				message: message, 
				salt: salt, 
				chatKeyId: keyId
		};
		this.socket.send(JSON.stringify(sendObject));
	}
	
	/*
	 * Asks Server for public Keys for a list of user ids
	 * 
	 * userIds: json-List of Ids
	 */
	Transport.prototype.getPublicKeys = function (userIds) {
		"use strict";
		var sendObject = {
			type: this.socketTypes.getPublicKeys,
			userIds: userIds
		};
		this.socket.send(JSON.stringify(sendObject));
	}
	
	/*
	 * Asks server for Chat contents 
	 * 
	 * chatId: int Id of Chat
	 * limit: int or NULL, count of messages
	 * time: datetime or NULL, only messages after timestamp
	 * lastId: int ID or NULL, only messages with larger id
	 */
	Transport.prototype.getChatContents = function (chatId, limit, time, lastId) {
		"use strict";
		var sendObject = {
			type: this.socketTypes.getChatContents,
			chatId: chatId,
			limit: limit
		};
		if (time != null) {
			sendObject.time = time;
		}
		if (lastId != null) {
			sendObject.lastId = lastId;
		}
		this.socket.send(JSON.stringify(sendObject));
	}
	
	/*
	 * sends new list of participants to Server
	 * 
	 * chatId: int Id of Chats
	 * participants: json-List of participants
	 */
	Transport.prototype.postChatParticipants = function (chatId, participants) {
		"use strict";
		var sendObject = {
			type: this.socketTypes.postChatParticipants,
			chatId: chatId,
			participants: participants
		}
		this.socket.send(JSON.stringify(sendObject));
	}
	
	/*
	 * sends message to Server to delete a Chat
	 * 
	 * chatId: int Id of chat
	 */
	Transport.prototype.deleteChat = function (chatId) {
		"use strict";
		var sendObject = {
			type: this.socketTypes.deleteChat,
			chatId: chatId
		}
		this.socket.send(JSON.stringify(sendObject));
	}
	
	window.Transport = Transport;
}());