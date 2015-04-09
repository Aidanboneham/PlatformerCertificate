
var Frame = function(x, y, width, height, duration){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.duration = duration;
};

var Sprite = function(filename) {
	if(filename != null)
	{
		this.image = document.createElement("img");
		this.image.src = filename;
	}
	
	this.currentAnimation = 0;
	this.currentFrame = 0;
	
		// this will be an array of frame arrays (so each element in the
		// animations array will be an array of frames)
	this.animations = [];		
	this.offsets = [];		// offset vectors for each animation
	
	this.frameTime = 0;
	this.loop = true;	
	this.pingpong = false;
	this.playDir = 1;
};

Sprite.prototype.setAnimation = function(index)
{
	if(index < 0 || index > this.animations.length)
		return;
	this.currentAnimation = index;
	this.currentFrame = 0;
}

Sprite.prototype.getFrameWidth = function()
{
	return this.animations[this.currentAnimation][this.currentFrame].width;
};

Sprite.prototype.getFrameHeight = function()
{
	return this.animations[this.currentAnimation][this.currentFrame].height;
};

Sprite.prototype.setLoop = function(loop) {
	return this.loop = loop;
};

Sprite.prototype.setAnimationOffset = function(anim, x, y) {
	this.offsets[anim].x = x;
	this.offsets[anim].y = y;
};

Sprite.prototype.getAnimationOffset = function() {
	return this.offsets[this.currentAnimation];
}

Sprite.prototype.buildAnimation = function(frameXCount, frameYCount, frameW, frameH, timeStep, animIdxArray)
{
	var animation = [];
			
	for(var i=0; i<animIdxArray.length; i++)
	{
		var index = animIdxArray[i];
		var fX = index%frameXCount;
		var fY = Math.floor(index/frameXCount);
		
		var u = fX * frameW;
		var v = fY * frameH;
		
		var frame = new Frame(u, v, frameW, frameH, timeStep);		
		animation.push(frame);
	}
	
	this.animations.push(animation);
	this.offsets.push( {x:0, y:0} );
};

Sprite.prototype.isFinished = function()
{
	if(this.currentFrame == this.animations[this.currentAnimation].length-1)
		return true;
	return false;
}

Sprite.prototype.update = function(dt) {
	if(this.animations.length == 0)
		return;
	if(this.animations[this.currentAnimation].length == 0)
		return;
	
	if(this.animations[this.currentAnimation][this.currentFrame].duration < 0)
		return;
	
	this.frameTime += dt;
	
	while(this.frameTime > this.animations[this.currentAnimation][this.currentFrame].duration)
	{
		this.currentFrame+=this.playDir;		
		
		
		if(this.currentFrame >= this.animations[this.currentAnimation].length || 
			this.currentFrame < 0)
		{
			if(this.pingpong == false)
			{
				this.currentFrame = 0;
			}
			else
			{
				this.currentFrame-=this.playDir;
				this.playDir = this.playDir*-1
				this.currentFrame+=this.playDir;
			}
		}
		this.frameTime -= this.animations[this.currentAnimation][this.currentFrame].duration;
	}
};

Sprite.prototype.draw = function(c, x, y) {
	// img	Specifies the image, canvas, or video element to use	 
	// sx	Optional. The x coordinate where to start clipping	
	// sy	Optional. The y coordinate where to start clipping	
	// swidth	Optional. The width of the clipped image	
	// sheight	Optional. The height of the clipped image	
	// x	The x coordinate where to place the image on the canvas	
	// y	The y coordinate where to place the image on the canvas	
	// width	Optional. The width of the image to use (stretch or reduce the image)	
	// height	Optional. The height of the image to use (stretch or reduce the image)
		
	c.drawImage(this.image, 
			this.animations[this.currentAnimation][this.currentFrame].x,
			this.animations[this.currentAnimation][this.currentFrame].y,
			this.animations[this.currentAnimation][this.currentFrame].width,
			this.animations[this.currentAnimation][this.currentFrame].height,
			x+this.offsets[this.currentAnimation].x, y+this.offsets[this.currentAnimation].y,
			this.animations[this.currentAnimation][this.currentFrame].width,
			this.animations[this.currentAnimation][this.currentFrame].height);
};








