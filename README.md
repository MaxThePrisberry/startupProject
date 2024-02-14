# The Maxwell Simulation

This is a personal startup project made as a part of CS 260 with Professor Jensen.



## Deliverable

### Elevator Pitch

Hey, my life has been pretty crazy recently and I'm really sorry I've never got around to playing that chess game with you we always talked about. Now, I know you *think* you're better and all that, but I think I've found a way to resolve all that. I call it...The Maxwell Simulation! The MS (Maxwell Simulation) is hosted online, is easily accesible, and allows anyone to play me in chess. At anytime. The MS can even play multiple people at once. Think of the time saved! You'll even be able to see where you rank among everyone, and come back to play me whenever you want!

### Design

This is how the user is prompted to login, to save their time score (upon a win) to the leaderboard database.

![The Login Interface](/loginpage.png)

This is what the displayed chess board looks like, with server notes about other players on the left, and comments made by 'me' on the bottom right.

![The Game Interface](/mainpage.png)

This is how the network will manage the gamestate and interaction on the game page.

![The Network](/network.png)

### Key Features

* Secure authentication with the server via HTTPS
* Ability to make illegal moves on the board in case you need to cheat
* Display of the chess board and individual pieces
* Ability to view all-time leaderboard of users that have beaten the 'MS' system along with their associated times
* Leaderboard results are permanently stored

### Technologies

* **HTML** - Structures the application as well as the chess board. Three HTML pages, the game page, the login page, and the leaderboard page.
* **CSS** - Makes the board look pretty, as well as formats the login box and leaderboard.
* **Javascript** - Updates the board without refreshing the page and enables login functionality.
* **Service** - Provides backend services for logging in and calculating a new board position.
* **MongoDB** - Stores leaderboard information and user login information.
* **Websocket** - As games finish, if the user has won they are added to the leaderboard database along with elapsed game time.
* **React** - Application ported to use the React framework.

## HTML Deliverable

For this deliverable I created the structure of my website using HTML.
* **Four Pages** - I created four separate html pages that represent a home page, a login page, a signin page, and the page you play chess on.
* **Text** - I have placed text or text placeholders where necessary for the implementation of live notifications (WebSocket) and my online persona speaking.
* **Links** - Each page has a link to each of the others for accesibility, all accessed through a navigation bar.
* **Image** - The image that represents myself is displayed on the play.html page.
* **Login** - Input boxes and an encapsulating form have been placed on the signin.html page so that users can log in.
* **WebSocket** - A text box has been placed in the play.html page that will be updated in real time with other player's results.
* **Database** - Leaderboards.html includes a table where the MongoDB leaderboard information will be placed.

## CSS Deliverable

For this deliverable I designed the appearance of my website using CSS and the Bootstrap framework.
* **General Structure** - Properly styled CSS header, footer, and main content body - *done* - Header and footer are adaptable to window size and effectively display links.
* **Navigation** - Properly styled CSS navigation elements - *done* - All navigation elements are organized and prominently displayed.
* **Resizing** - Responsive to window resizing - *done* - Site elements resize, especially play.html to adjust for the size of the chess board. Different screen sizes are accounted for with Bootstrap.
* **Application Elements** - Properly styled CSS application elements - *done* - The chess board uses css (and a lil JavaScript) to calculate the proper size for screen height and width. Bootstrap columns are effectively used for content display and adjustability.
* **Application Content** - Properly styled CSS application text content - *done* - The site uses a cool font and text is placed correctly for dialogue from 'me' and WebSocket notifications.
* **Application Images** - Properly styled CSS application images - *done* - Logo and the representation of me use CSS to regulate size and appearance, including a colorful border to view while playing.


