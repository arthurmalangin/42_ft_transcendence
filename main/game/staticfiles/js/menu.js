document.addEventListener('menuplay_event', async()=>{
	function menuEvent() {
		const registerLabel = document.getElementById('btn_logout');
		registerLabel.addEventListener('click', () => {
			logout();
		});

		const leaderboardLabel = document.getElementById('btn_leaderboard');
		leaderboardLabel.addEventListener('click', () => {
			history.pushState(null, '', '/leaderboard');
			loadPage('/leaderboard');
		});

		const settingsLabel = document.getElementById('btn_settings');
		settingsLabel.addEventListener('click', () => {
			history.pushState(null, '', '/');
			loadPage('/settings');
		});

		const homeLabel = document.getElementById('btn_home');
		homeLabel.addEventListener('click', () => {
			history.pushState(null, '', '/');
			loadPage('/');
		});

		const friendsLabel = document.getElementById('btn_friends');
		friendsLabel.addEventListener('click', () => {
			history.pushState(null, '', '/friends');
			loadPage('/friends');
		});

		const gameLabel = document.getElementById('btn_game');
		gameLabel.addEventListener('click', () => {
			history.pushState(null, '', '/menu');
			loadPage('/menu');
		});

		// const brickbreakerLabel = document.getElementById('btn_brickbreaker');
		// brickbreakerLabel.addEventListener('click', () => {
		// 	history.pushState(null, '', '/brickbreaker');
		// 	loadPage('/brickbreaker');
		// });

        // Game mode cards

        const btn_pong_classic = document.getElementById('btn_pong_classic');
        btn_pong_classic.addEventListener('click', () => {
            history.pushState(null, '', '/game');
            loadPage('/game');
        });

        // const btn_pong_tournament = document.getElementById('btn_pong_tournament');
        // btn_pong_classic.addEventListener('click', () => {
        //     history.pushState(null, '', '/404');
        //     loadPage('/404');
        // });

        // const btn_pong_4players = document.getElementById('btn_pong_4players');
        // btn_pong_classic.addEventListener('click', () => {
        //     history.pushState(null, '', '/404');
        //     loadPage('/404');
        // });

        const btn_brickbreaker_classic = document.getElementById('btn_brickbreaker_classic');
        btn_brickbreaker_classic.addEventListener('click', () => {
            history.pushState(null, '', '/brickbreaker');
            loadPage('/brickbreaker');
        });

        // const btn_brickbreaker_tournament = document.getElementById('btn_brickbreaker_tournament');
        // btn_pong_classic.addEventListener('click', () => {
        //     history.pushState(null, '', '/404');
        //     loadPage('/404');
        // });

        // Event listeners handlers

        
    }

    menuEvent();

});