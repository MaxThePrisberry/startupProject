import { useState, useEffect } from 'react';
function timeToSeconds(timeStr) {
    const regex = /(\d+)\s*d\s*(\d+)\s*h\s*(\d+)\s*m\s*(\d+)\s*s/;
    const matches = timeStr.match(regex);
    if (matches) {
        const days = parseInt(matches[1]) || 0;
        const hours = parseInt(matches[2]) || 0;
        const minutes = parseInt(matches[3]) || 0;
        const seconds = parseInt(matches[4]) || 0;
        return days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds;
    }
    return 0; // Default to 0 if parsing fails
}

async function fillTable(setScores) {
        //simulate table data
        //tableData = [["Today", "Your Mom", "0d 2h 3m 15s"], ["Yesterday", "John Johnson", "4d 2h 42m 0s"], ["The day before yesterday", "Tanner Swendsen", "0d 0h 0m 2s"]];

        let tableData = await fetch('/lb/topgames');
        tableData = await tableData.json();

        tableData = tableData.sort((a,b) => (timeToSeconds(a.time) - timeToSeconds(b.time)));

        let table = [];

        tableData.forEach((value, i) => {
                table.push(<tr key={i}><td>{value.date}</td><td>{value.name}</td><td>{value.time}</td></tr>);
        });

	setScores(table);
}

export function Leaderboard() {
	const [scores, setScores] = useState([]);
	useEffect(() => {
		fillTable(handleScores);
	}, []);

	function handleScores(scores) {
		setScores(scores);
	}

	return (
        	<main className="d-flex w-100 m-auto align-items-center justify-content-center">
        <div className="row w-75 justify-content-center align-items-center">
                <div className="d-flex w-100 text-center flex-column align-items-center justify-content-center col-8">
                        <h2>Current Leaderboard</h2>
                        <table className="table table-bordered w-75">
                                <thead>
					<tr>
                                        	<th><b>Date</b></th>
                                        	<th><b>Name</b></th>
                                        	<th><b>Time</b></th>
                                	</tr>
                        	</thead>
				<tbody id='leadertable'>
					{scores}
				</tbody>
			</table>
                </div>
        </div>
    </main>
	);
}

