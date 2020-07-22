import { Vec3 } from '../lib/pearl';

export function fromPearlConfig(world, pearlConfig){
    return world.createPearl(
        new Vec3(pearlConfig.x, pearlConfig.y, pearlConfig.z),
        new Vec3(pearlConfig.vx, pearlConfig.vy, pearlConfig.vz)
    );
}
export function fromTntConfig(world, pearl, tntConfig){
    return world.createTntLauncher(pearl, new Vec3(tntConfig.x1, tntConfig.y1, tntConfig.z1), new Vec3(tntConfig.x2, tntConfig.y2, tntConfig.z2));
}