Space Invaders created by Paul Grochocinski and Slava Likhachov.

Assignment 1 for CSC309H1 at the University of Toronto.

February 3, 2014.



Controls:
	
Enter = Begin the game on the welcome screen when html is launched.
	
Left-Arrow = Move the player ship to the left, can be held down for faster movement.
	
Right-Arrow = Move the player ship to the right, can be held down for faster movement.
	
Spacebar = Fire the ship’s rocket at the aliens, can be held down for faster firing.
	
p = Pause the game if needed, will keep the current state of the game when pressed.
	
u = Unpause the game from the pause screen, will begin at the state where the game was paused. 



Rules:
	Destroy all aliens on the screen while dodging the bombs that are dropped by them. 
The game is a sandbox that ends only when you run out of lives, the aliens come in contact with your ship, or they reach the bottom of the screen.



The game’s core is modelled after the original Space Invaders arcade game.

 It consists of four objects: the aliens, the ship, the bombs fired by the aliens 
and the rockets fired by the player. The aliens make their way down in a controlled sweeping pattern starting from the top of the canvas, dropping bombs at random intervals, each of which removes
a single life if it comes into contact with the player's ship. 

The ship is controlled by the player using the left and right arrow keys. The ship is capable of 
shooting rockets at the aliens using the space bar, each of which destroys the first alien it hits, with the exception of the boss.

The main objective 
for the player is to stop the aliens from reaching the bottom and hitting the player, and this is accomplished by destroying all of the aliens that are populated 
each level in a timely fashion. 
As the levels progress, the game becomes harder in the following ways: the aliens get faster each level, they drop bombs 
more frequently, there are more aliens populated (up to a certain point), and the lives of the player are persistent.

To add a twist to the original game, 
we have added a Boss level that occurs every third level containing a single significantly more powerful alien. The boss also gets harder with each appearance and 
carries its own arsenal of weapons to attack the player with. The game is implemented by using a canvas tag in an html file, and that is where 
all the action takes place. The canvas is a set size, and all the images are drawn onto the canvas using an image source. Key events are 
used (specifically keyUp and keyDown) to trigger events in the game like ship movement, and are kept track of in a variable called pressedKeys. All variables that 
are unchanged in the game are initialized before the welcome screen that the player sees, such as the image dimensions. When the welcome screen is exited the 
rest of the variables are initialized by start(), in which they will be updated every time a level is beat and before the new level begins. 

The ship, aliens, rockets, 
bombs, etc, of the game are “classes”, meaning that they are functions that are initialized by the game with set parameters. The main part of the game is the game loop, 
which is repeated every 15 ms. It contains the main events such as bomb dropping, 
rocket firing, handling key events, collision checks, etc, that all influence the state of the game and refreshes the state so that the current game reflects any changes. 
For example, if an alien is killed, it will update the array of aliens that are present for that level and remove the one that was killed, and so in the next loop, 
that alien will not be present and so it will not be drawn to the canvas, and so on. The canvas at the end of each cycle is also cleared so that there are no lingering 
images of the ship or the aliens as they move across the screen.


Enjoy the game, and have fun destroying the alien invaders!