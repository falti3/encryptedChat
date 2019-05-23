<?php
namespace ChatServer;

class ChatMessageHandler extends AbstractMessageHandler{
    /*
     * Loads system messages from chat with chatId and message id for every participant
     */
    public function newSystemMessageForParticipants($chatId, $messageId) {
        echo "newSystemMessageForParticipants\r\n";
        $output = array();
        $innerArray = array();
        
        
        $query = $this->_db->prepare("SELECT `participantId` FROM `chat_participant` WHERE chatId = ?;");
        $query->bind_param("i", $chatId);
        $query->execute();
        
        $ids = $this->returnResultArrayOfQuery($query);
        
        if ($ids === NULL) {
            $output["type"] = "error";
            $output["error"] = $this->_db->error;
            return $output;
        }

        $query = $this->_db->prepare("SELECT * FROM `system_message` WHERE `id` = ?;");
        $query->bind_param("i", $messageId);
        $query->execute();
        
        $message = $this->returnResultOfQuery($query, "systemMessages");
        $output["messages"] = $message;
        $output["participantIds"] = $ids;
        return $output;
    }
    
    /*
     * Loads a message from a chat with chatId and messageId for all participants
     */
    public function newMessageForParticipants($chatId, $messageId) {
        echo "newMessageForParticipants\r\n";
        $output = array();
        $innerArray = array();
        
        $query = $this->_db->prepare("SELECT `participantId` FROM `chat_participant` WHERE chatId = ?;");
        $query->bind_param("i", $chatId);
        $query->execute();
        $ids = $this->returnResultArrayOfQuery($query);

        if ($ids === NULL) {
            $output["type"] = "error";
            $output["error"] = $this->_db->error;
            return $output;
        }
        
        $query = $this->_db->prepare("SELECT * FROM `message` WHERE `id` = ?;");
        $query->bind_param("i", $messageId);
        $query->execute();
        
        $message = $this->returnResultOfQuery($query, "chatMessages");
        $output["messages"] = $message;
        $output["participantIds"] = $ids;
        return $output;      
    }
    
    /*
     * Stores a new message to the database
     */
    public function postMessage ($chatId, $message, $salt, $chatKeyId, $senderId)
    {
        echo"postMessage\r\n";
        $output = array();
        
        if ($chatId === NULL || $message === NULL || $salt === NULL || $chatKeyId === NULL || $senderId === NULL)
        {
            $output["type"] = "error";
            $output["error"] = "missing params";
            return json_encode($output);
        }
        
        $my_date = date("Y-m-d H:i:s");
        
        $query = $this->_db->prepare("INSERT INTO `message` (`content`, `salt`, `time`, `chatId`, `chatKeyId`, `senderId`) VALUES (?,?,?,?,?,?)");
        $query->bind_param("sssiii", $message, $salt, $my_date, $chatId, $chatKeyId, $senderId);
        $query->execute();
        
        return $this->returnIdOfQuery($query, "postMessage");
    }
    
    /*
     * Stores a new list of participants to a chat
     */
    public function postChatParticipants ($chatId, $participants) {
        echo"postChatParticipants\r\n";
        $output = array();
        
        if ($chatId === NULL || $participants === NULL || !is_array($participants))
        {
            $output["type"] = "error";
            $output["error"] = "missing params";
            return json_encode($output);
        }
        
        $getOldParticipants = $this->_db->prepare("SELECT participantId FROM `chat_participant` WHERE chatId = ?;");
        $getOldParticipants->bind_param("i", $chatId);
        $getOldParticipants->execute();
        $oldParticipants = $this->returnResultArrayOfQuery($getOldParticipants);
        
        $toRemove = array();
        $toAdd = array();
        
        foreach ($oldParticipants as $oldParticipant) {
            $found = false;
            foreach ($participants as $newParticipant) {
                if (strcmp($oldParticipant["participantId"], $newParticipant) == 0) {
                    $found = true;
                }
            }
            if (!$found) {
                echo $oldParticipant["participantId"]." nicht gefunden!";
                array_push($toRemove, $oldParticipant["participantId"]);
            }
        }

        if (count($toRemove) > 0) {
            
            foreach ($toRemove as $toRemoveId) {
                $removeString = $this->_db->prepare("DELETE FROM `chat_participant` WHERE chatId = ? and participantId = ?;");
                $removeString->bind_param("ii", $chatId, $toRemoveId);
                $removeString->execute();
                $this->doQuery($removeString, "removeParticipants");
            }
        }

        foreach ($participants as $newParticipant) {
            $found = false;
            foreach ($oldParticipants as $oldParticipant) {
                if (strcmp($oldParticipant["participantId"], $newParticipant) == 0) {
                    $found = true;
                }
            }
            if (!$found) {
                echo $newParticipant." nicht gefunden!";
                array_push($toAdd, $newParticipant);
            }
        }
        if (count($toAdd) > 0) {
            foreach ($toAdd as $toAddId) {
                $addString = $this->_db->prepare("INSERT INTO `chat_participant` (`chatId`, `participantId`) VALUES (?,?);");
                $addString->bind_param("ii", $chatId, $toAddId);
                $addString->execute();
                $this->doQuery($addString, "addParticipants");
            }  
        }
        
        $output["type"] = "postChatParticipants";
        return json_encode($output);
    }
    
    /*
     * Stores a new system message to the database
     */
    public function postSystemMessage ($chatId, $message, $salt, $chatKeyId)
    {
        echo"postSystemMessage\r\n";
        $output = array();
        
        if ($chatId === NULL || $message === NULL || $salt === NULL || $chatKeyId === NULL)
        {
            $output["type"] = "error";
            $output["error"] = "missing params";
            return json_encode($output);
        }
        
        $my_date = date("Y-m-d H:i:s");

        $query = $this->_db->prepare("INSERT INTO `system_message` (`content`, `salt`, `time`, `chatId`, `chatKeyId`) VALUES (?,?,?,?,?)");
        $query->bind_param("sssii", $message, $salt, $my_date, $chatId, $chatKeyId);
        $query->execute();
        return $this->returnIdOfQuery($query, "postSystemMessage");
    }
    
    /*
     * Stores a new personal chat key
     */
    public function postPersonalChatKey ($key, $salt, $userId, $keyId)
    {
        echo"postPersonalChatKey\r\n";
        $output = array();
        
        if ($key === NULL || $salt === NULL || $userId === NULL || $keyId === NULL)
        {
            $output["type"] = "error";
            $output["error"] = "missing params";
            return json_encode($output);
        }
        
        $query = $this->_db->prepare("INSERT INTO `personal_chat_key` (`chatKeyId`, `chatKey`, `salt`, `userId`) VALUES (?,?,?,?)");
        $query->bind_param("issi", $keyId, $key, $salt, $userId);
        $query->execute();
        return $this->returnIdOfQuery($query, "postPersonalChatKey");

    }
    
    /*
	 * Creates a new entry for a chat key in the database, this id is used for the personal chat keys
	 * of the participants
     */
    public function createChatKey ($chatId)
    {
        echo"createChatKey\r\n";
        $output = array();
        if ($chatId === NULL)
        {
            $output["type"] = "error";
            $output["error"] = "missing params";
            $output["hint"] = "chatId";
            return json_encode($output);
        }

        $query = $this->_db->prepare("INSERT INTO `chat_key` (`chatId`) VALUES (?);");
        $query->bind_param("i", $chatId);
        $query->execute();
        $output = $this->returnIdOfQuery($query, "createChatKey");
        
        $o = json_decode($output, true);
        $o["chatId"] = $chatId;
        return json_encode($o);
    }
    
    /*
     * Creates a new chatroom
     */
    public function createChat ($chatname)
    {
        echo"createChat\r\n";
        $output = array();
        if ($chatname === NULL)
        {
            $output["type"] = "error";
            $output["error"] = "missing params";
            $output["hint"] = "chatname";
            return json_encode($output);
        }
        
        $query = $this->_db->prepare("INSERT INTO `chat` (`name`) VALUES (?)");
        $query->bind_param("s", $chatname);
        $query->execute();
        return $this->returnIdOfQuery($query, "createChat");
    }
    
    /*
     * Loads personal chatkey for an Id
     */
    function getPersonalChatKey($chatKeyId) {
        echo "getPersonalChatKey\r\n";
        $output = array();
        if ($chatKeyId == NULL) {
            $output["type"] = "error";
            $output["error"] = "missing params";
            return json_encode($output);
        }

        $query = $this->_db->prepare("SELECT pck.id as personalChatKeyId, pck.chatKeyId, ck.chatId, pck.chatKey, pck.salt FROM `personal_chat_key` as pck".
            " JOIN `chat_key` as ck".
            " ON pck.chatKeyId = ck.id".
            " WHERE pck.id = ?;");
        $query->bind_param("i", $chatKeyId);
        $query->execute();
        return $this->returnFirstResultOfQuery($query, "getPersonalChatKey");
    }
    
    /*
     * Loads all personal chat keys for a chat and participant
     */
    function getPersonalChatKeys($chatId, $clientId) {
        echo "getPersonalChatKeys\r\n";
        $output = array();
        if ($chatId == NULL || $clientId == NULL) {
            $output["type"] = "error";
            $output["error"] = "missing params";
            return json_encode($output);
        }

        $query = $this->_db->prepare("SELECT pck.id as personalChatKeyId, pck.chatKeyId, ck.chatId, pck.chatKey, pck.salt FROM `personal_chat_key` as pck".
            " JOIN `chat_key` as ck".
            " ON pck.chatKeyId = ck.id".
            " WHERE pck.userId = ? AND chatId = ?;");
        $query->bind_param("ii", $clientId, $chatId);
        $query->execute();
        return $this->returnResultOfQuery($query, "getPersonalChatKeys");
    }

    /*
     * Loads all messages of a chatroom, possibly limited by
     * time: datetime of first message or NULL
     * limit: int count or NULL
     * lastiId: int minimum message id or NULL
     */
    function getChatMessages($chatId, $time = NULL, $userId = NULL, $limit = 50, $lastId = NULL) {
        echo"getChatMessages\r\n";
        $output = array();
        $limitCondition = $limit;
        $timeCondition = "";
        $keyCondition = "";
        $idCondition = "";
        
        if ($time == NULL) {
            $time = "01.01.1970";
        }
        if ($lastId == NULL) {
            $lastId = -1;
        }
        
        if ($userId !== NULL) {
            $query1 = $this->_db->prepare("SELECT pck.id, pck.chatkeyId FROM `personal_chat_key` AS pck".
                            " JOIN `chat_key` as ck".
                            " ON pck.chatkeyId = ck.id".
                            " WHERE pck.userId = ? ".
                            " AND ck.chatId = ?;");
            $query1->bind_param("ii", $userId, $chatId);
            $query1->execute();
            $rows = $this->returnResultArrayOfQuery($query1);
            
            if (count($rows) > 0) {
                $placeholders = array_fill(0, count($rows), '?');
                $keyCondition = " AND chatKeyId in (".implode(",", $placeholders).") ";
            }
        }
        

        
        if ($chatId === NULL)
        {
            $output["type"] = "error";
            $output["error"] = "missing params";
            $output["hint"] = "chatId";
            return json_encode($output);
        }
        
        $queryString = "SELECT * FROM ".
                    "(SELECT * FROM `message`".
                    " WHERE `chatId` = ? ".
                    " AND time > ? ".
                    $keyCondition.
                    " AND id > ? ".
                    " ORDER BY id DESC LIMIT ?)sub ".
                    "ORDER BY id ASC;";
        echo "\r\n $queryString \r\n";
        
        $query = $this->_db->prepare($queryString);
        
        $paramString = "is";
        $userids = array();
        
        foreach ($rows as &$value) {
            $paramString = $paramString."i";
            array_push($userids, $value["chatkeyId"]);
        }
        $paramString = $paramString."ii";
        $params = array();
        array_push($params, $chatId);
        array_push($params, $time);
        $params = array_merge($params, $userids);
        array_push($params, $lastId);
        array_push($params, $limit);
        
       
        $query->bind_param($paramString, ...$params);
        $query->execute();

        return $this->returnResultOfQuery($query, "chatMessages");
    }
    
    /*
     * Loads system messages of a chat room, possibly limited by
     * time: datetime of first message or NULL
     * limit: int maximum count of messages or NULL
     * lastiId: int minimum of message id or NULL
     */
    function getSystemMessages($chatId, $time = NULL, $userId = NULL, $limit = 50, $lastId = NULL) {
        echo"getSystemMessages\r\n";
        $output = array();
        $limitCondition = $limit;
        $timeCondition = "";
        $keyCondition = "";
        $idCondition = "";
        
        if ($time == NULL) {
            $time = "01.01.1970";
        }
        if ($lastId == NULL) {
            $lastId = -1;
        }
        
        if ($userId !== NULL) {
            $query1 = $this->_db->prepare("SELECT pck.id, pck.chatkeyId FROM `personal_chat_key` AS pck".
                " JOIN `chat_key` as ck".
                " ON pck.chatkeyId = ck.id".
                " WHERE pck.userId = ? ".
                " AND ck.chatId = ?;");
            $query1->bind_param("ii", $userId, $chatId);
            $query1->execute();
            $rows = $this->returnResultArrayOfQuery($query1);

            if (count($rows) > 0) {
                $placeholders = array_fill(0, count($rows), '?');
                $keyCondition = " AND chatKeyId in (".implode(",", $placeholders).") ";
            }
        }
        
        
        
        if ($chatId === NULL)
        {
            $output["type"] = "error";
            $output["error"] = "missing params";
            $output["hint"] = "chatId";
            return json_encode($output);
        }
        
        $query = $this->_db->prepare("SELECT * FROM ".
            "(SELECT * FROM `system_message`".
            " WHERE `chatId` = ? ".
            " AND time > ? ".
            $keyCondition.
            " AND id > ? ".
            " ORDER BY id DESC LIMIT ?)sub ".
            "ORDER BY id ASC;");
            
            $paramString = "is";
            $userids = array();
            
            foreach ($rows as &$value) {
                $paramString = $paramString."i";
                array_push($userids, $value["chatkeyId"]);
            }
            $paramString = $paramString."ii";
            $params = array();
            array_push($params, $chatId);
            array_push($params, $time);
            $params = array_merge($params, $userids);
            array_push($params, $lastId);
            array_push($params, $limit);
            
            
            $query->bind_param($paramString, ...$params);
            $query->execute();
            
            return $this->returnResultOfQuery($query, "systemMessages");
    }
    
    /*
     * Loads chats of a user
     */
    function getChats($userId = NULL, $lastId = NULL) {
        echo"getChats\r\n"; 
        $output = array();

        
        $idCondition = "";
        $userCondition = "";
        $whereCondition = "";
        if ($userId !== NULL || $lastId !== NULL) {
            $whereCondition = " WHERE ";
            $both = false;
            if ($userId !== NULL) {
                $userCondition = " p.participantId = '".$userId."' ";
                $both = true;
            }
            if ($lastId !== NULL) {
                if ($both) {
                    $idCondition = " AND ";
                }
                $idCondition = $idCondition. "c.id > ".$lastId;
            }
        }
        
       
        
        if ($userId != NULL) {
            if ($lastId !== NULL) {
                $query = $this->_db->prepare("SELECT c.id, c.name FROM `chat_participant` AS p".
                    " JOIN `chat` AS c".
                    " ON p.chatId = c.id ".
                    " WHERE p.participantId = ? AND c.id > ?;");
                $query->bind_param("ii", $userId, $lastId);
                $query->execute();
                return $this->returnResultOfQuery($query, "getChats");
            }
            $query = $this->_db->prepare("SELECT c.id, c.name FROM `chat_participant` AS p".
                " JOIN `chat` AS c".
                " ON p.chatId = c.id ".
                " WHERE p.participantId = ?;");
            $query->bind_param("i", $userId);
            $query->execute();
            return $this->returnResultOfQuery($query, "getChats");
        }
        
        if ($lastId !== NULL) {
            $query = $this->_db->prepare("SELECT c.id, c.name FROM `chat_participant` AS p".
                " JOIN `chat` AS c".
                " ON p.chatId = c.id ".
                " WHERE c.id > ?;");
            $query->bind_param("i", $lastId);
            $query->execute();
            return $this->returnResultOfQuery($query, "getChats");
        } 
        $query = $this->_db->prepare("SELECT c.id, c.name FROM `chat_participant` AS p".
            " JOIN `chat` AS c".
            " ON p.chatId = c.id");
        $query->execute();
        return $this->returnResultOfQuery($query, "getChats");
    }
    
    /*
     * Loads participants of a chat if ignoreId is set all participants except ignoreId are sent
     */
    function getChatParticipants($chatId, $ignoreId = NULL) {
        echo"getChatParticipants\r\n";
        $output = array();
        
        if ($chatId === NULL)
        {
            $output["type"] = "error";
            $output["error"] = "missing params";
            $output["hint"] = "chatId";
            return json_encode($output);
        }
        
        if ($ignoreId !== NULL) {
            $query = $this->_db->prepare("SELECT u.id, u.name, u.publicKey FROM `chat_participant` AS p ".
                " JOIN `user` AS u ".
                " ON p.participantId = u.id ".
                " WHERE chatId = ? ".
                " AND p.participantId != ?;");
            $query->bind_param("ii", $chatId, $ignoreId);
            $query->execute();
            
            return $this->returnResultOfQuery($query, "chatParticipants");
        }
        
        $query = $this->_db->prepare("SELECT u.id, u.name, u.publicKey FROM `chat_participant` AS p ".
            " JOIN `user` AS u ".
            " ON p.participantId = u.id ".
            " WHERE chatId = ?;");
        $query->bind_param("i", $chatId);
        $query->execute();
        return $this->returnResultOfQuery($query, "chatParticipants");
    }
    
    /*
     * Loads chats and participants, if ignoreId is set all participants except ignoreId are searched
	 */
    function getChatWithParticipants($chatId, $ignoreId = NULL) {
        echo"getChatWithParticipants\r\n";
        $output = array();
        
        if ($chatId === NULL)
        {
            $output["type"] = "error";
            $output["error"] = "missing params";
            $output["hint"] = "chatId";
            return json_encode($output);
        }
        
        if ($ignoreId !== NULL) {
            $query = $this->_db->prepare("SELECT u.id, u.name, u.publicKey FROM `chat_participant` AS p ".
                " JOIN `user` AS u ".
                " ON p.participantId = u.id ".
                " WHERE chatId = ? AND p.participantId != ?;");
            $query->bind_param("ii", $chatId, $ignoreId);
            $query->execute();
            $participants = $this->returnResultArrayOfQuery($query);
        } else {
            $query = $this->_db->prepare("SELECT u.id, u.name, u.publicKey FROM `chat_participant` AS p ".
                " JOIN `user` AS u ".
                " ON p.participantId = u.id ".
                " WHERE chatId = ?;");
            $query->bind_param("i", $chatId);
            $query->execute();
            $participants = $this->returnResultArrayOfQuery($query);
        }
        
        $query = $this->_db->prepare("SELECT id, name FROM `chat` WHERE id = ?;");
        $query->bind_param("i", $chatId);
        $query->execute();
        $chat = $this->returnResultOfQuery($query, "chatParticipants");
        echo "\r\n getChatWithParticipants dingens \r\n";
        var_dump($participants);
        var_dump($chat);
        
        $chatParsed = json_decode($chat, true);
        
        $chatParsed["0"]["participants"] = $participants;
        $chatParsed["type"] = "chatParticipants";
        return json_encode($chatParsed);
    }
}
