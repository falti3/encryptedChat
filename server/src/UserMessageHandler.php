<?php
namespace ChatServer;

class UserMessageHandler extends AbstractMessageHandler {
    /*
     * Login user, result is storage
     */
    public function login ($username, $password)
    {
        echo"login\r\n";
        $output = array();
        if ($username === NULL || $password === NULL)
        {
            $output["type"] = "error";
            $output["error"] = "missing params";
            return json_encode($output);
        }
        
        $query = $this->_db->prepare(
            "SELECT `user`.name, `user`.id, `user`.keySalt, `user`.publicKey, `user_storage`.updateTime, `user_storage`.storage, `user_storage`.salt FROM `user` ".
            "LEFT JOIN `user_storage` ".
            "ON `user`.id = `user_storage`.userId ".
            "WHERE `user`.`name` = ? ".
            "AND CAST(`user`.`password` AS CHAR)= ?;");

        $query->bind_param("ss", $username, $password);
        $query->execute();
        return $this->returnFirstResultOfQuery($query, "login");
    }
    
    /*
     * Return salt for username
     */
    public function getSalt ($username)
    {
        echo"getSalt\r\n";
        $output = array();
        if ($username === NULL)
        {
            $output["type"] = "error";
            $output["error"] = "missing params";
            $output["hint"] = "username";
            return json_encode($output);
        }
        
        $query = $this->_db->prepare("SELECT `passwordSalt` AS salt FROM `user` WHERE `name`=?;");
        $query->bind_param("s", $username);
        $query->execute();
        
        return $this->returnFirstResultOfQuery($query, "getSalt");
    }
    
    /*
     * Save storage of user
     */
    public function storeStorage ($userId, $storage, $salt)
    {
        echo"storeStorage\r\n";
        $output = array();
        if ($userId === NULL || $storage === NULL || $salt === NULL)
        {
            $output["type"] = "error";
            $output["error"] = "missing params";
            return json_encode($output);
        }
        
        $my_date = date("Y-m-d H:i:s");
        
        $query = $this->_db->prepare("INSERT INTO `user_storage` (`userId`, `storage`, `salt`, `updateTime`) VALUES (?,?,?,?);");
        $query->bind_param("isss", $userId, $storage, $salt, $my_date);
        $query->execute();
        
        return $this->returnIdOfQuery($query, "storeStorage");
    }
    
    /*
     * Create user with name, encrypted passphrase, salts and public key
     */
    public function createAccount ($username, $password, $passwordSalt, $keySalt, $publicKey)
    {
        echo "createAccount\r\n";
        $output = array();
        if ($username === NULL || $password === NULL || $passwordSalt === NULL || $keySalt === NULL || $publicKey === NULL)
        {
            $output["type"] = "error";
            $output["error"] = "missing params";
            return json_encode($output);
        }
        
        $querySelect = $this->_db->prepare("SELECT * from `user` WHERE `name`=?;");
        $querySelect->bind_param("s", $username);
        $querySelect->execute();
        //$querySelect = "SELECT * from `user` WHERE `name`='".$this->_db->real_escape_string($username)."';";
        
        if ($querySelect->num_rows !== 0) {
            $output["type"] = "error";
            $output["error"] = "username already taken";
            return json_encode($output);
        }
        $querySelect->close();
        $query = $this->_db->prepare("INSERT INTO `user` (`name`, `password`, `passwordSalt`, `keySalt`, `publicKey`) VALUES (?,?,?,?,?);");
        $query->bind_param("sssss", $username, $password, $passwordSalt, $keySalt, $publicKey);
        $query->execute();

        return $this->returnIdOfQuery($query, "createAccount");
    }

    /*
     * Return all public keys of a user
     */
    public function getPublicKeys ($userIds)
    {
        echo"getPublicKey\r\n";
        $output = array();
        
        if ($userIds === NULL)
        {
            $output["type"] = "error";
            $output["error"] = "missing params";
            $output["hint"] = "$userIds";
            return json_encode($output);
        }

        $output["type"] = "getPublicKeys";
        $output["keys"] = array();


        foreach ($userIds as $userId) {
            $query = $this->_db->prepare("SELECT `id`, `publicKey` from `user` WHERE `id` = ?;");
            $query->bind_param("i", $userId);
            $query->execute();
            $result = $this->returnFirstResultOfQuery($query, "");
            
            echo "\r\n in der useridschleife: \r\n";
            var_dump($result);
            
            array_push($output["keys"], $result);
        }

        return $output;
    }
}
