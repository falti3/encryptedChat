<?php
namespace ChatServer;

use mysqli;

class Database {
	private $_handler;

	function __construct () {
								   //placeholder passwords
	                               //host         user      password  database
		$this->_handler = new mysqli("localhost", "sonate", "sonate", "sonate2");
		if ($this->_handler->connect_error)
		{
		    echo "Error in MySQL-Connection!";
			die("Error: " . $this->_handler->connect_error);
		}
	}

	function __destruct () {
		if ($this->_handler)
		{
			$this->_handler->close();
		}
	}

	function sql () {
		return $this->_handler;
	}
}