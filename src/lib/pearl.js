
/**
 * Utility math class: 3 dimentional vector
 * @param {number} x 
 * @param {number} y 
 * @param {number} z 
 */
function Vec3(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
}
/**
 * @param {Vec3} v
 */
Vec3.prototype.add = function(v){
    return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
}
/**
 * @param {Vec3} v
 */
Vec3.prototype.minus = function(v){
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
}
/** @param {number} a */
Vec3.prototype.multiply = function(a){
    return new Vec3(a * this.x, a * this.y, a * this.z);
}
/** @param {Vec3} v */
Vec3.prototype.distance2 = function(v){
    var x = this.x - v.x, y = this.y - v.y, z = this.z - v.z;
    return x*x + y*y + z*z;
}
/** @param {Vec3} v */
Vec3.prototype.distance = function(v){
    return Math.sqrt(this.distance2(v));
}
/** @param {Vec3} v */
Vec3.prototype.unitVecTo = function(v){
    return v.minus(this).multiply(1 / this.distance(v));
}
/** @param {Vec3} v */
Vec3.prototype.distance2d2 = function(v){
    var x = this.x - v.x, z = this.z - v.z;
    return x*x + z*z;
}

function World(){
    this.k = 0.99;
    this.g = new Vec3(0, -0.03, 0);
    this.pearlEyesHeight = 0.25 * 0.85;
    this.tntPower = 4;
    this.tntExplosionHeight = 0.98/16;
}
/**
 * Create a pearl trajectory object
 * @param {Vec3} r0 pearl position
 * @param {Vec3} v0 pearl velocity
 */
World.prototype.createPearlTrajectory = function(r0, v0){
    return new PearlTrajectory(this, r0, v0);
}
World.prototype.createTntLauncher = function(pearl, pos1, pos2){
    return new TNTLauncher(this, pearl, pos1, pos2);
}
/**
 * 
 * @param {Vec3} r0 
 * @param {Vec3} v0 
 */
World.prototype.createPearl = function(r0, v0){
    return new Pearl(this, r0, v0);
}

/**
 * @param {World} world
 * @param {Vec3} r0 
 * @param {Vec3} v0 
 */
function Pearl(world, r0, v0){
    this.world = world;
    this.r0 = r0;
    this.v0 = v0;
}
/** 
 * @param {World} world
 * @returns {Pearl} */
Pearl.prototype.step = function(ticks){
    var traj = this.world.createPearlTrajectory(this.r0, this.v0);
    return new Pearl(
        this.world,
        traj.getPosition(ticks || 1),
        traj.getVelocity(ticks || 1)
    );
}

/**
 * The equation of motion of Ender pearl is
 * 
 * $$
 * \vec r_{n + 1} = \vec r_n + \vec v_n;
 * \vec v_{n + 1} = k\vec v_n + \vec g.
 * $$
 * 
 * Where $k = 0.99$ is the damping constant, $\vec g = (0, -0.03, 0)$ is used to simulate gravity.
 * These two equations has the solution
 * \vec 
 * 
 * @param {World} world
 * @param {Vec3} r0
 * @param {Vec3} v0
 */

function PearlTrajectory(world, r0, v0){
    this.world = world;
    this.r0 = r0;
    this.v0 = v0;
}
PearlTrajectory.prototype.getVelocity = function(tick){
    var a = this.world.g.multiply(1 / (1 - this.world.k));
    return this.v0.minus(a).multiply(Math.pow(this.world.k, tick)).add(a);
}
/**
 * Get the pearl's position after specific ticks
 * @param {number} tick 
 */
PearlTrajectory.prototype.getPosition = function(tick){
    var k = this.world.k, g = this.world.g;
    return this.r0.add(
        this.v0.add(g.multiply(1 / (k - 1))).multiply((1 - Math.pow(k, tick)) / (1 - k))
    ).add(g.multiply(tick / (1 - k)));
}
/**
 * Get the tick that the y component of the pearl's velocity reaches maximum value.
 * Note: might be negative or null
 */
PearlTrajectory.prototype.getMaxYTick = function(){
    var g = this.world.g, k = this.world.k;
    var v2 = g.multiply(1 - k), v1 = this.v0.minus(v2);
    var a1 = v1.y, a2 = v2.y;
    if (a1 > 0 && a2 < 0 || a1 < 0 && a2 > 0){
        return Math.ceil(Math.log(-a2 / a1) / Math.log(k));
    }
    else {
        return null;
    }
}

/**
 * Class used to calculate the initial velocity of ender pearl
 * @param {World} world
 * @param {Pearl} pearl
 * @param {Vec3} pos1
 * @param {Vec3} pos2
 * @param {Vec3} r0 
 * @param {Vec3} v0
 */
function TNTLauncher(world, pearl, pos1, pos2){
    this.world = world;
    this.pearl = pearl;
    this.pos1 = pos1.add(new Vec3(0, world.tntExplosionHeight, 0));
    this.pos2 = pos2.add(new Vec3(0, world.tntExplosionHeight, 0));
}
/**
 * Calculate initial velocity
 * @param {number} n1 TNT amount
 * @param {number} n2 TNT amount
 */
TNTLauncher.prototype.getInitialVelocity = function(n1, n2){
    var r = this.world.tntPower * 2, r0 = this.pearl.r0;
    var rG = r0.add(new Vec3(0, this.world.pearlEyesHeight, 0));
    var v1 = this.pos1.unitVecTo(rG).multiply(n1 * (1 - r0.distance(this.pos1) / r));
    var v2 = this.pos2.unitVecTo(rG).multiply(n2 * (1 - r0.distance(this.pos2) / r));
    return v1.add(v2).add(this.pearl.v0);
}
/**
 * Solve the required initial velocity
 * @param {Vec3} distination 
 * @param {number} tick 
 */
TNTLauncher.prototype.solveInitialVelocity = function(distination, tick){
    var g = this.world.g, k = this.world.k;
    var r = distination.minus(this.pearl.r0).minus(g.multiply(tick / (1 - k)));
    return r.multiply((1 - k) / (1 - Math.pow(k, tick))).add(g.multiply(1 / (1 - k)));
}
/**
 * Solve TNT Amount
 * @param {Vec3} v 
 * @param {number} tick 
 */
TNTLauncher.prototype.solveTNTAmount = function(v){
    var v0 = v.minus(this.pearl.v0), r0 = this.pearl.r0;
    var d = this.world.tntPower * 2;
    var rG = r0.add(new Vec3(0, this.world.pearlEyesHeight, 0));
    var vi1 = this.pos1.unitVecTo(rG).multiply(1 - Math.sqrt(this.pos1.distance2(r0)) / d);
    var vi2 = this.pos2.unitVecTo(rG).multiply(1 - Math.sqrt(this.pos2.distance2(r0)) / d);
    var M = vi1.x * vi2.z - vi1.z * vi2.x;
    return [
        (v0.x * vi2.z - v0.z * vi2.x) / M,
        (vi1.x * v0.z - vi1.z * v0.x) / M
    ];
}

export { World, Vec3 };