;
(function() {
	"use strict";

	/*
	 * For output inside HTML
	 */
	
	/*
	 * constructor
	 */
	function ChatNotifications() {
		"use strict";
		
		this.userId = null;
		this.clearUsers();
	}
	
	/*
	 * sets User ID
	 * 
	 * userId: int Id of user
	 */
	ChatNotifications.prototype.setUserId = function (userId) {
		"use strict";
		this.userId = userId;
	}
	
	/*
	 * changes display of unread messages for a list of chats
	 * 
	 * chats: json-list of chats with count of unread messages
	 * currentChatId: int Id of current chat
	 */
	ChatNotifications.prototype.updateUnreadMessageCount = function(chats, currentChatId) {
		"use strict";
		for (var key in chats) {
			if (chats.hasOwnProperty(key) && chats[key].id != currentChatId && chats[key].messageCount > 0) {
				var element = document.getElementById("chatMessageCount"+ chats[key].id);
				element.outerHTML = "<span class=\"newMessages\" id=\"chatMessageCount"	+ chats[key].id	+ "\">" + chats[key].messageCount + "</span>";
			}
		}
	}
	
	/*
	 * Clears count of unread messages of a chat
	 * 
	 * chatId: int Id of chat
	 */
	ChatNotifications.prototype.clearMessageCount = function (chatId) {
		"use strict";
		var messageCountElement = document.getElementById("chatMessageCount"+chatId);
		messageCountElement.outerHTML=
			"<span class=\"newMessages\" id=\"chatMessageCount"+chatId+"\" display:\"none\">0</span>";
	}
	
	/*
	 * Removes chatActive-flag of all chats
	 * 
	 * chatId: not used
	 */
	ChatNotifications.prototype.removeActiveClasses = function (chatId) {
		"use strict";
		var newInactive = document.getElementsByClassName("chatActive");
		for (var i=0; i<newInactive.length; i++) {
			newInactive[i].classList.remove("chatActive");
		}
	}
	
	/*
	 * adds chatActive-flag to a Chat
	 * 
	 * chat: json-Object, containing the Id
	 */
	ChatNotifications.prototype.updateActiveChatClass = function (chat) {
		"use strict";
		var chatElement = document.getElementById("chatObject"+chat.id);
		chatElement.outerHTML=
			"<div class=\"chat chatActive\" id=\"chatObject"+chat.id+"\" onclick=\"c.openChat("+chat.id+")\">"+
			  "<span>"+chat.name+"</span><span class=\"newMessages\" id=\"chatMessageCount"+chat.id+"\" style=\"display: none;\">"+chat.messageCount+"</span>"+
	 	    "</div>";
	}
	
	/*
	 * Draws List of chat participants
	 * 
	 * userId: Id of current user
	 * participants: json-List of participants
	 */
	ChatNotifications.prototype.redrawParticipants = function (userId, participants) {
		"use strict";
		
		var participantsBox = document.getElementById("participantsContainer");
		if (participantsBox != null) {
			participantsBox.innerHTML = "";
		}
		
		var innerHTML = "<div class=\"participantsContainer\" id=\"participantsContainer\">"+
	 	"<div class=\"participant\">Teilnehmer: </div>";
		var color = this.resolveUserColor(userId);
		if (color == null) {
			color = this.addLastUnusedColor(userId);
		}
		innerHTML+="<div class=\"participant boxColor"+color+"\">Ich<span class=\"rounded\" onclick=\"removeParticipant("+userId+")\">-</span></div>";
		
		for (var i=0; i<participants.length; i++) {
			if (participants[i].id != userId) {
			color = this.resolveUserColor(participants[i].id);
			if (color == null) {
				color = this.addLastUnusedColor(participants[i].id);
			}
			innerHTML+="<div class=\"participant boxColor"+color+"\">"+participants[i].name+"<span class=\"rounded\" onclick=\"removeParticipant("+participants[i].id+")\">-</span></div>";
			}
		}
	 	
		innerHTML+="<button onclick=\"addNewParticipant()\">+</button></div>";	
		
		var chatBox = document.getElementById("chatboxContainer");
		chatBox.innerHTML = innerHTML+chatBox.innerHTML;
	}
	
	/*
	* Clears Messages
	*/
	ChatNotifications.prototype.clearChat = function() {
		"use strict";
		var chatBox = document.getElementById("chatboxContainer");
		chatBox.innerHTML = "";
	}
	
	/*
	* Appends messages to a chat
	* 
	* message: json-Object with messages
	*/
	ChatNotifications.prototype.appendMessage = function(message) {
		"use strict";
		var chatBox = document.getElementById("chatboxContainer");
		
		var boxClass = "boxReceiver"
		if (this.messageIsFromMe(message.senderId)) {
			boxClass = "boxSender";
		}
			
		var color = this.resolveUserColor(message.senderId);
		if (color == null) {
			color = this.addLastUnusedColor(message.senderId);
		}
		chatBox.innerHTML+="<div class=\"chatbox "+boxClass+" boxColor"+color+"\">" +
				"<p>"+message.plaintext+"</p>" +
				"<span class=\"time\">"+this.resolveUserName(message.senderId)+" - "+message.time+"</span></div>";
	}
	
	/*
	* appends messages to a Chat
	* 
	* messages: json-List of messages
	*/
	ChatNotifications.prototype.appendMessages = function(messages) {
		"use strict";
		for (var i=0;i<messages.length; i++) {
			this.appendMessage(messages[i]);
		}
	}

	/*
	 * Removes Chat from List
	 * 
	 * chatId: int Id of Chats
	 */
	ChatNotifications.prototype.removeChat = function (chatId) {
		"use strict;"
		var container = document.getElementById("chatObject"+chatId);
		if (container != null) {
			container.parentNode.removeChild(container);
		}
	}
	
	/*
	 * Appends a Chat to the list
	 * 
	 * chatObject: json-Object, containing Id, Name, messagecounter
	 */
	ChatNotifications.prototype.appendNewChat = function (chatObject) {
		"use strict;"
		var container = document.getElementById("chatsContainer");
		container.innerHTML+=
			"<div class=\"chat\" id=\"chatObject"+chatObject.id+"\" onclick=\"c.openChat("+chatObject.id+")\">"+
			  "<span>"+chatObject.name+"</span><span class=\"newMessages\" id=\"chatMessageCount"+chatObject.id+"\" style=\"display: none;\">"+chatObject.messageCount+"</span>"+
	 	    "</div>";
	}
	
	/*
	 * Checks if userId is of current user
	 * 
	 * userId: int Id of a user
	 */
	ChatNotifications.prototype.messageIsFromMe = function (userId) {
		"use strict";
		return userId == this.userId;
	}
	
	/*
	 * returns username to userId
	 * 
	 * userId: int Id of a user
	 */
	ChatNotifications.prototype.resolveUserName = function (userId) {
		"use strict";
		return this.userNames[userId];
	}
	
	/*
	 * returns color of a userId
	 * 
	 * userId: int Id of a user
	 */
	ChatNotifications.prototype.resolveUserColor = function (userId) {
		"use strict";
		return this.userColors[userId];
	}
	
	/*
	 * maps an unused color to a user
	 * 
	 * userId: int Id of a user
	 */
	ChatNotifications.prototype.addLastUnusedColor = function (userId) {
		"use strict";
		var color = 1;
		if (!this.messageIsFromMe(userId)) {
			for (var key in this.userColors) {
				if (this.userColors.hasOwnProperty(key)) {
					if (this.userColors[key] > color) {
						color = this.userColors[key];
					}
				}
			}
			color++; 
		}
		this.userColors[userId] = color;
		return this.userColors[userId];
	}
	
	/*
	 * clears usernames- and colors
	 */
	ChatNotifications.prototype.clearUsers = function () {
		"use strict";
		this.userNames = {};
		this.userColors = {};
	}
	
	/*
	 * Appends new usernames to variable
	 * 
	 * participants: json-List of participants
	 * userObject: json-Object of current user
	 */
	ChatNotifications.prototype.updateUserNames = function(participants, userObject) {
		"use strict";
		for (var i=0; i<participants.length; i++) {
			this.userNames[participants[i].id] = participants[i].name;
		}
		this.userNames[userObject.id] = userObject.name;
	}
	
	window.ChatNotifications = ChatNotifications;
}());