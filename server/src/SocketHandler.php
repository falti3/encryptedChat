<?php
namespace ChatServer;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class SocketHandler implements MessageComponentInterface {
    protected $clients;
    protected $clientIds = array();

    public function __construct() {
        $this->_db = new Database();
        $this->_chat = new ChatMessageHandler($this->_db->sql());
        $this->_user = new UserMessageHandler($this->_db->sql());
        
        
        //echo "construct sockethandler\r\n";
        $this->clients = new \SplObjectStorage;
    }

    public function onOpen(ConnectionInterface $conn) {
        // Store the new connection to send messages to later
        $this->clients->attach($conn);

        echo "New connection! ({$conn->resourceId})\n";
    }
    
    public function getClientId($resourceId) {
        echo "getClientId: $resourceId\r\n";
        return $this->clientIds["$resourceId"];
    }
    
    public function addClientId($resourceId, $id) {
        echo "addclient: $id\r\n";
        $this->clientIds["$resourceId"] = "$id";
    }
    
    public function sendErrorMessage($client) {
        $error = array();
        $error["type"] = "error";
        $error["error"] = "wrong user id";
        return json_encode($error);
        $client->send($error);
    }
    
    /*
     * Load chats 
     */
    public function getChats($userId, $lastId = NULL) {
        $output = array();
        $output = $this->_chat->getChats($userId, $lastId);
        $o = json_decode($output, true);
        echo"\r\n";
        foreach ($o as &$chat) {
            if (is_array($chat)) {
                $participants = $this->_chat->getChatParticipants($chat["id"], $userId);
                $p = json_decode($participants, true);
                $chat["participants"] = array();
                foreach ($p as $part) {
                    if (is_array($part)) {
                        $chat["participants"][] = $part;
                    }
                }
            }
        }
        return json_encode($o);
    }

    /*
     * Handle incoming messages from frontend
     * 
     */
    public function onMessage(ConnectionInterface $from, $msg) {
        $message = json_decode($msg, true);
        var_dump($message);
        echo "type: ".$message["type"]."\r\n";
        $output = array();
        switch ($message["type"]) {
            case "onopenmessage"://todo -> loginmessage
                /*
				 * insert id of client with resourceId to a variable to have a mapping of the two
                 */
                echo "onopenmessage!\r\n";
                $this->addClientId($from->resourceId, $message["contents"]["id"]);
                break;
            case "getMessages":
                /*
                 * return messages of a chat
                 * 
                 * chatId int
                 * time datetime/NULL
                 * limit int/NULL
                 * lastId int/NULL
                 */
                $output = $this->_chat->getChatMessages($message["chatId"], $message["time"], $this->clientIds["$from->resourceId"], $message["limit"], $message["lastId"]);
                break;
            case "getSystemMessages":
                /*
                 * return system messages of a chat
                 *
                 * chatId int
                 * time datetime/NULL
                 * limit int/NULL
                 * lastId int/NULL
                 */
                $output = $this->_chat->getSystemMessages($message["chatId"], $message["time"], $this->clientIds["$from->resourceId"], $message["limit"], $message["lastId"]);
                break;
            case "getChats":
                /*
                 * returns a list of all chats of a user, userId and resourceId have to be matching
                 *
                 * userId int
                 */
                $foundUserId = $this->getClientId($from->resourceId);
                if (strcmp($foundUserId, $message["userId"]) !== 0) {
                    return sendErrorMessage($from);
                }
                $from->send($this->getChats($foundUserId, $message["lastId"]));
                break;
            case "getParticipants":
                /*
                 * return all participants of a chat
                 * 
                 * chatId int
                 */
                $output = $this->_chat->getChatParticipants($message["chatId"]);
                $from->send(json_encode($output));
                break;
            case "createAccount":
                /*
                 * create a new account
                 * 
                 * username string
                 * password string
                 * passwordSalt string
                 * keySalt string
                 * publicKey string
                 */
                $output = $this->_user->createAccount($message["username"],$message["password"] ,$message["passwordSalt"], $message["keySalt"], $message["publicKey"]);
                $o = json_decode($output, true);
                $this->addClientId($from->resourceId, $o["id"]);
                $from->send($output);
                break;
            case "getSalt":
                /*
                 * returns salt to a username
                 * 
                 * username string
                 */
                $output = $this->_user->getSalt($message["username"]);
                $from->send($output);
                break;
            case "login":
                /*
                 * login user with passphrase
                 * 
                 * username string
                 * password string
                 */
                $output = $this->_user->login($message["username"], $message["password"]);
                $o = json_decode($output, true);
                echo "logincase:\r\n";
                var_dump($output);
                $from->send($output);
                // insert mapping of userId and ResourceId
                if ($o["id"] != null) {
                    $this->addClientId($from->resourceId, $o["id"]);
                    $from->send($this->getChats($o["id"]));
                }
                break;
            case "storeStorage":
                /*
                 * save storage of user if userId and resourceId are matching
                 * 
                 * userId int
                 */
                $foundUserId = $this->getClientId($from->resourceId);
                if (strcmp($foundUserId, $message["userId"]) !== 0) {
                    return sendErrorMessage($from);
                }
                $output = $this->_user->storeStorage($message["userId"], $message["storage"], $message["salt"]);
                break;
            case "getPublicKeys":
                /*
                 * return public keys of multiple users
                 * 
                 * userIds Json-List int
                 */
                $output = $this->_user->getPublicKeys($message["userIds"]);
                $from->send(json_encode($output));
                break;
            case "createChat":
                /*
                 * create chat with name and key returns ids
                 * 
                 * chatname string
                 */
                
                //create room
                $output = $this->_chat->createChat($message["chatname"]);
                $o = json_decode($output, true);
                //create key
                $output2 = $this->_chat->createChatKey($o["id"]);
                $o2 = json_decode($output2, true);
                $output = array();
                $output["type"] = "createChat";
                $output["chatId"] = $o["id"];
                $output["chatKeyId"] = $o2["id"];
                //return chatId und chatKeyId
                $from->send(json_encode($output));
                break;
            case "createChatKey":
                /*
                 * creates a chatKey for a chat (creates an entry in the database and returns id)
                 * 
                 *  chatId int
                 */
                $output = $this->_chat->createChatKey($message["chatId"]);
                $from->send($output);
                break;
            case "postPersonalChatKey":
                /*
                 * saves personal chatkey for a user and keyId to the database, returns Id 
                 * sends chatkey to user, for whom the key was created
                 * 
                 * key string
                 * salt string
                 * userId int
                 * keyId int
                 */
                $output = $this->_chat->postPersonalChatKey($message["key"], $message["salt"], $message["userId"], $message["keyId"]);
                $from->send($output);
                foreach ($this->clients as $client) {
                    if (strcmp($this->getClientId($client->resourceId), $message["userId"]) == 0) {
                        $o = json_decode($output, true);
                        $personalKey = $this->_chat->getPersonalChatKey($o["id"]);
                        $client->send($personalKey);
                        break;
                    }
                }
                break;
            case "postSystemMessage":
                /*
                 * Saves systemmessage for a chat, sends it to all users of chat
                 * 
                 * chatId int
                 * message string
                 * salt string
                 * chatKeyId int
                 */
                $output = $this->_chat->postSystemMessage($message["chatId"], $message["message"], $message["salt"], $message["chatKeyId"]);
                $from->send($output);
                $o = json_decode($output, true);
                $outputArray = $this->_chat->newSystemMessageForParticipants($message["chatId"], $o["id"]);
                foreach ($outputArray["participantIds"] as $participant) {
                    foreach ($this->clients as $client) {
                        if (strcmp($this->getClientId($client->resourceId), $participant["participantId"]) == 0) {
                            $client->send($outputArray["messages"]);
                            break;
                        }
                    }
                }
                break;
            case "postMessage":
                /*
                 * saves message to chat, sends it to all participants 
                 *
                 * chatId int
                 * message string
                 * salt string
                 * chatKeyId int
                 */
                $output = $this->_chat->postMessage($message["chatId"], $message["message"], $message["salt"], $message["chatKeyId"], $this->clientIds["$from->resourceId"]);
                $from->send($output);
                $o = json_decode($output, true);
                $outputArray = $this->_chat->newMessageForParticipants($message["chatId"], $o["id"]);
                foreach ($outputArray["participantIds"] as $participant) {
                    foreach ($this->clients as $client) {
                        if (strcmp($this->getClientId($client->resourceId), $participant["participantId"]) == 0) {
                            $client->send($outputArray["messages"]);
                            break;
                        }
                    }
                }
                break;
            case "getChatContents":
                /*
				 * gets chat contents (keys, messages, system messages) possibly limited by number, time or lastId
                 * returns contents
                 * 
                 * chatId int
                 * time datetime/NULL
                 * limit int/NULL
                 * lastId int/NULL
                 */
                $chatId = null;
                $time = null;
                $limit = null;
                $lastId = null;
                $fromId = $this->clientIds["$from->resourceId"];
                if (array_key_exists("chatId", $message)) {
                    $chatId = $message["chatId"];
                }
                if (array_key_exists("time", $message)) {
                    $time = $message["time"];
                }
                if (array_key_exists("limit", $message)) {
                    $limit = $message["limit"];
                }
                if (array_key_exists("lastId", $message)) {
                    $lastId = $message["lastId"];
                }
                
                
                $messages = $this->_chat->getChatMessages($chatId, $time, $fromId, $limit, $lastId);
                $systemMessages = $this->_chat->getSystemMessages($chatId, $time, $fromId, $limit, $lastId);
                $keys = $this->_chat->getPersonalChatKeys($chatId, $fromId);
                $output["messages"] = $messages;
                $output["systemMessages"] = $systemMessages;
                $output["keys"] = $keys;
                $output["type"] = "getChatContents";
                $from->send(json_encode($output));
                break;
            case "postChatParticipants":
                /*
                 * saves new list of participants to a chat, checks if
                 *      new participants are there, sends them the chat
                 *      send message to removed participants,
                 *      
                 * chatId int
                 * participants json-list of participants
                 */
                $chatParticipantsOldJson = $this->_chat->getChatWithParticipants($message["chatId"]);
                $chatParticipantsOld = json_decode($chatParticipantsOldJson, true);
                
                
                $output = $this->_chat->postChatParticipants($message["chatId"], $message["participants"]);
                $from->send($output);
                
                $chatParticipantsJson = $this->_chat->getChatWithParticipants($message["chatId"]);
                $chatParticipants = json_decode($chatParticipantsJson, true);
                foreach ($chatParticipants["0"]["participants"] as $participantEntry) {
                    if (is_array($participantEntry)) {
                        foreach ($this->clients as $client) {
                            if (strcmp($this->getClientId($client->resourceId), $participantEntry["id"]) == 0) {
                                $client->send($chatParticipantsJson);
                                break;
                            }
                        }                    
                    }
                }
                
                $removedFromChat = array();
                $removedFromChat["chatId"] = $message["chatId"];
                $removedFromChat["type"] = "removedFromChat";
                $removedFromChatJson = json_encode($removedFromChat);
                
                foreach ($chatParticipantsOld["0"]["participants"] as $oldParticipantEntry) {
                    if (is_array($oldParticipantEntry)) {
                        $found = false;
                        foreach ($chatParticipants["0"]["participants"] as $participantEntry) {
                            if (is_array($participantEntry)) {
                                if (strcmp($participantEntry["id"], $oldParticipantEntry["id"]) == 0) {
                                    $found = true;
                                }
                            }
                        }
                        if (!$found) {
                            foreach ($this->clients as $client) {
                                if (strcmp($this->getClientId($client->resourceId), $oldParticipantEntry["id"]) == 0) {
                                    $client->send($removedFromChatJson);
                                    break;
                                }
                            }
                        }
                    }
                }
                break;
            case "deleteChat":
                /*
                 * deletes chat and sends message to all former participants
                 * 
                 * chatId int
                 */
                $chatParticipantsOldJson = $this->_chat->getChatWithParticipants($message["chatId"]);
                $chatParticipantsOld = json_decode($chatParticipantsOldJson, true);
                $removedFromChat = array();
                $removedFromChat["chatId"] = $message["chatId"];
                $removedFromChat["type"] = "removedFromChat";
                $removedFromChatJson = json_encode($removedFromChat);
                foreach ($chatParticipantsOld["0"]["participants"] as $oldParticipantEntry) {
                    if (is_array($oldParticipantEntry)) {
                        foreach ($this->clients as $client) {
                            if (strcmp($this->getClientId($client->resourceId), $oldParticipantEntry["id"]) == 0) {
                                $client->send($removedFromChatJson);
                            }
                        }
                    }
                }
                $output = $this->_chat->postChatParticipants($message["chatId"], array());
                break;
            default:
                var_dump($msg);
                echo "kenne den type nicht!\r\n";
        }
    }

    public function onClose(ConnectionInterface $conn) {
        // The connection is closed, remove it, as we can no longer send it messages
        $this->clients->detach($conn);

        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";

        $conn->close();
    }
}
?>