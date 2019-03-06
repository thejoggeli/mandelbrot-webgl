<?php

	require_once(__DIR__ . "/../db/db.php");

	header('Content-type: application/json');
	
	function getRealIpAddr(){
		if (!empty($_SERVER['HTTP_CLIENT_IP'])){
		  $ip=$_SERVER['HTTP_CLIENT_IP'];
		}
		elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])){
		  $ip=$_SERVER['HTTP_X_FORWARDED_FOR'];
		} else {
		  $ip=$_SERVER['REMOTE_ADDR'];
		}
		return $ip;
	}
	
	session_start();
	$wait = 30;
	$time = $_SESSION["save_time"] ?? 0;
	if(time()-$time < $wait){
		$remain = $wait - (time()-$time);
		echo json_encode(["error" => "too-soon", "message" => "Wait $remain seconds"]);
		exit;
	}	

	$ip = getRealIpAddr();
	$date_str = (new DateTime())->format("Y-m-d H:i:s");
	$json_str = $_POST["state"];
		
	$return["date"] = $date_str;
	$return["name"] = $date_str;
	$return["ip"] = $ip == "::1" ? null : $ip;
	
	$stmt = $conn->prepare('INSERT INTO state (date, ip, json) VALUES (?, ?, ?)');
	$stmt->bind_param('sss', $date_str, $ip, $json_str);
	if(!$stmt->execute()){
		$return["error"] = $stmt->error;
	}
	
	$_SESSION["save_time"] = time();
		
	echo json_encode($return);

?>
