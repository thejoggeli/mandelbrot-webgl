<?php

	require_once(__DIR__ . "/../db/db.php");
	
	$stmt = $conn->prepare("SELECT id, date, ip, json FROM state ORDER BY date DESC");	
	$stmt->execute();
	$stmt->bind_result($id, $date, $ip, $json);
	
	
	
?>
<!DOCTYPE html>
<html><head>
	<title>
		Mandelbrot States
	</title>
	<style>
		body {font-family:arial;font-size:14px;}
		table {border-collapse: collapse;}
		table td,
		table th {border:1px solid black;vertical-align:top;white-space:nowrap;padding:4px;text-align:center;}
		table th {}	
		table .td-json {padding:0;vertical-align:middle;}	
		table .td-json input {border:0;width:100%;height:100%;padding:4px;box-sizing:border-box;outline:0;font-size:14px;}	
	</style>
</head><body>
	<table>
		<tr>
			<th>id</th>
			<th>date</th>
			<th>ip</th>
			<th>json</th>
			<th></th>
	<?php while($stmt->fetch()): ?>
		<tr>
			<td><?= $id ?></td>
			<td><?= $date ?></td>
			<td><?= $ip ?></td>
			<td class="td-json">
				<input type="text" value="<?= htmlspecialchars($json) ?>" onclick="this.select()">
			</td>
			<td><a href="..?<?= http_build_query(["state" => $json]) ?>">Load</a></td>
		</tr>
	<?php endwhile; ?>
	</table>
</body></html>