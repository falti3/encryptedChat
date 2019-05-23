<?php
namespace ChatServer;

class AbstractMessageHandler {
    protected $_db;

    function __construct ($db) {
        $this->_db = $db;
    }
    
    function resultsToArray($query, $firstEntryOnly) {
        $rows = array();
        $result = $query->get_result();
        while ($row = $result->fetch_array(MYSQLI_ASSOC))
        {
            if ($firstEntryOnly) {
                foreach ($row as $r => $r_value)
                {
                    $rows[$r] = $r_value;
                }
                return $rows;
            }

            $thisRow = array();
            foreach ($row as $r => $r_value)
            {
                $thisRow[$r] = $r_value;
            }
            array_push($rows, $thisRow);
        }
        return $rows;
    }
    
    function returnFirstResultOfQuery($query, $type) {
        $output = array();
        if ($query->errno > 0) {
            echo "error in query: \r\n";
            echo $query->error;
            $output["type"] = "error";
            $output["error"] = $query->error;
            return json_encode($output);
        }

        $output = $this->resultsToArray($query, true);
        $output["type"] = "$type";
        $query->close();
        return json_encode($output);
    }
    
    function returnResultOfQuery($query, $type) {
        $output = array();
        
        if ($query->errno > 0) {
            echo "error in query: \r\n";
            echo $query->error;
            $output["type"] = "error";
            $output["error"] = $query->error;
            return json_encode($output);
        }
        
        $output = $this->resultsToArray($query, false);
        $output["type"] = "$type";
        $query->close();
        return json_encode($output);
    }
    
    function returnIdOfQuery($query, $type) {
        $output = array();
        
        if ($query->errno > 0) {
            echo "error in query: \r\n";
            echo $query->error;
            $output["type"] = "error";
            $output["error"] = $query->error;
            return json_encode($output);
        }

        $output["type"] = "$type";
        $output["id"] = $this->_db->insert_id;
        $query->close();
        return json_encode($output);
    }
    
    function doQuery($query, $type) {
        if ($query->errno > 0) {
            echo "error in query: \r\n";
            echo $query->error;
            $output["type"] = "error";
            $output["error"] = $query->error;
            return json_encode($output);
        }
        
        $output["type"] = "$type";
        $output["success"] = "true";
        $query->close();
        return json_encode($output);
    }
    
    function returnResultArrayOfQuery($query) {
        $output = array();
        
        if ($query->errno > 0) {
            echo "error in query: \r\n";
            echo $query->error;
            return null;
        }
        
        $output = $this->resultsToArray($query, false);
        $query->close();
        return $output;
    }

}
