<!DOCTYPE html>
<html><div class="welcome">
  <h1>Hi there, welcome to <i>Pong</i> 👋</h1>
  <subtitle><i>Pong</i> (also know as transcendence in the 42 curriculum) is a web application for the classic arcade game <i>Pong</i>.<br>
<i>Pong</i> is implemented as a <code>Docker</code> container. 
The <code>Docker</code> container acts as a server that runs the <i>Pong</i> web application.
By hosting the game within the container, multiple users can access the web page and play the game simultaneously on the same server.<br>
<i>Pong</i> utilizes <code>NestJS</code> for the backend and <code>Vue.js</code> for the frontend and the database is <code>PostgreSQL</code>.<br>
The <code>NestJS</code> backend handles HTTP endpoints, WebSocket Gateways, and interacts with the database. For database interaction we used an ORM called <code>Prisma</code>.<br>
<code>Vue.js</code> powers the responsive frontend, delivering an interactive user interface where people can play <i>Pong</i> and chat.<br>
<i>Pong</i> was created by Lissanne81(frontend + backend of the game), HzLin(frontend), vdkJelle(backend + frontend of matchmaking), and TessavdL(backend + frontend of the chat).</subtitle>
</div>

<div class="user">
  <h2>User</h2>
  Users can find information on other users on the user page. They can see each other's username, avatar and activity status.
  The activity status can be online, in a game or offline.
  If someone wants more information on a user they can clikc their profile and it will also display their match history and ranking.
  Users can send friend requests, accept friend requests and block other users.
  This is also the place where users can find the match history and leaderboard.
</div>

<div class="profile">
  <h2>Update profile</h2>
  Users can change their username. The new username must be unique and cannot be longer than 20 characters.
  A default avatar is created randomly when the user first creates their profile. The avatar can be changed by uploading an image.
  Users can enable and disable two-factor authentication.
</div>

<div class="chat">
  <h2>Chat</h2>
  The chat of <i>Pong</i> allows users to do the following:
  <ul>
    <li>Create chat channels with different access levels: public, protected, or private.</li>
    <ul>
      <li>Public channels can be joined by anyone.</li>
      <li>Protected channels require a password to enter.</li>
      <li>Private channels are invite-only and cannot be found in the "View All Channels" menu.</li>
    </ul>
    <li>Invite other users to join chat channels or be invited to existing channels. Existing channels can be found in the "View All Channels" menu.</li>
    <li>View the full message history upon entering a channel.</li>
    <li>Send messages to others in direct messages and chat channels.</li>
    <li>Receive instant messages from other members in the chat channel.</li>
    <li>Invite each other to play a game of <i>Pong</i> and be redirected to the game.</li>
    <li>Channels have roles: owner, admin, and member, each with specific privileges:</li>
    <ul>
      <li>All users have member privileges: they can view other members' profiles, invite others for a game, and leave or abandon the channel.</li>
      <li>The user who created the channel is the owner.</li>
      <li>Ownership can be transferred if the owner chooses to abandon the channel.</li>
      <li>As the channel owner, change channel settings, including adding, changing, or removing channel passwords (hashed and stored in the database).</li>
      <li>As the channel owner, penalize admins or members by banning, kicking, or muting them.</li>
      <li>As the channel owner, add new members to the channel.</li>
      <li>Promote members to admin or demote admins to members.</li>
      <li>Admins can ban, kick, and mute members, but not other admins or the owner.</li>
    </ul>
  </ul>
</div>

<div class="game">
  <h2>Game</h2>  
  <div class="matchmaking">
    <h4>Matchmaking</h4>
    If a player wishes to play a game they can press <code>Play</code> in on the home page.
    They are redirected to a matchmaking page that will wait for an opponent.
    When an opponent connects they are removed from the queue and redirected to the game.
    The game can only be played by these two players, you can't play a game against yourself.
    Leaving the page will remove a player from the queue.
  </div>
  <h4>Rules</h4>
  <p>Player1 starts left and player2 starts right. Players can move their paddles up and down.
  If the ball hits the padde it's reflected back to the other player. The goal is to get the ball behind the other player to score a point.
  The first person who scores three points wins the game. After the game has ended a game over screen is visible and the match history is updated.</p>
  <h4>Controls</h4>
    <p>Move paddle up and down with <code>arrow key up</code> and <code>arrow key down</code> respectively</p>
    <p>Start the game by clicking <code>start</code> on screen or press <code>space</code></p>
  <h4>Options</h4>
  <p>Players can switch between classic or neon color mode with the switch above the game.
</div>

<div class="clone">
  <h2>How to clone the repository</h2>
  <ol>
    <li>Above the list of files, click <code>< > Code</code>.</li>
    <li>Copy the url of the repository.</li>
    <li>Open up a terminal.</li>
    <li>Clone the repostiory using the <code>git clone</code> command. You can type in <code>git clone</code> and paste the url you just copied after it. It is also recommended to specify the target location (e.g. where you would like the repository to be cloned to).
<p>

```
git clone <url> <target_location>
```
  </p>
      <p>For example:</p><p>

```
git clone https://github.com/TessavdL/transcendence pong
```
  </p>
      <p>This will create a new directory called pong and will clone the github repostiory into it. Please note if you do not specify name_of_target_directory, the repostitory will be cloned into your working directory.</p>
    </li>
    <li>Press enter and you've successfully cloned the repostitory!</li>
  </ol>
</div>
<div class="run">
  <h2>How to run Pong</h2>
  <ol>
    <li>Change your directory to the directory you've just cloned.</li><p>
      
```
cd <target_location>
```
  </p>
    <li><i>Pong</i> needs certain <code>.env</code> files in order for the environmental variables needed by the database, backend and frontend to be set properly</li>
    <li>Make sure you're in the root of the directory. Create the following files: <code>./.env</code>, <code>./back_end/app/.env</code>, <code>./front_end/app/.env</code>.</li>
    <li>In <code>./.env</code> create the following variables and set the value in between the <code>"</code> to your liking.
      
```
POSTGRES_DB=""
POSTGRES_USER=""
POSTGRES_PASSWORD=""
```
   <li>
<p>In <code>./backend/app/.env</code> create the following variables and set the value in between the <code>"</code> according to the description below.</p>
     
```
DATABASE_URL="postgresql://postgres:POSTGRES_PASSWORD":5432/POSTGRES_DB?schema=public&connection_timeout=300"
TWO_FACTOR_AUTHENTICATION_APP_NAME=""
JWT_SECRET=""
HOST="localhost"
```
<p>For <code>DATABASE_URL</code> replace <code>POSTGRES_PASSWORD</code> with the value of <code>POSTGRES_PASSWORD</code> and <code>POSTGRES_DB</code> with the value of <code>POSTGRES_DB</code> from the previous <code>./.env</code> file.</p>
<p>For <code>TWO_FACTOR_AUTHENTICATION_APP_NAME</code> change the value beween the <code>"</code> to your liking.</p>
<p>For <code>JWT_SECRET</code> set the value to a random string that is 32 characters long.</p>
<p>For <code>HOST</code> set the value to localhost if you're not planning on using the app with more than one person. Otherwise, set the value to your local ipaddress.
We used this to find our local ipaddress on MacOS/Linux: <code>ip addr show eth0 | awk '/inet / {split($2, a, "/"); print a[1]}'</code>.</p>
  <li>In <code>./front_end/app/.env</code> do the same thing as for <code>HOST</code> in the previous <code>./back_end/.env</code> file.
  Instead of HOST the variable name is now VITE_HOST.
      
```
VITE_HOST="localhost"
```
   <li><i>Pong</i> requires <code>Docker</code> to host the web application. Start <code>Docker Desktop</code>.</li>
    <li>If <code>Docker</code> has started you can build the project with <code>docker compose --build up</code>. It will take between 5 and 15 minutes to build.</li>
    <li>After the container is built you can access the web application in the browser by visiting <code>http://localhost:5173</code>.
   If you changed the host to your local ip address change localhost to that ip address.</li>
    <li>If you wish to stop <i>Pong</i> you can use the press <code>ctrl + c</code> in the terminal, type in <code>docker compose down</code> in another terminal or stop the container in <code>Docker Desktop</code>.</li>
    <li>To clean up all containers you can run <code>docker system prune -a</code> and press <code>y</code>.</li>
  </ol>
</div>
