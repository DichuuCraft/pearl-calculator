import { fromPearlConfig, fromTntConfig } from './util';
import { getSelected } from '../configs';

export default {
    type: 'pearl-trajectory',
    inputs: {
        'n1': ['TNT数量1', 'TNT 1'],
        'n2': ['TNT数量2', 'TNT 2'],
        'ticks': ['游戏刻数', 'ticks']
    },
    run: function(world, inputs){
        var tntConfig = getSelected('tnt-config');
        var pearlConfig = getSelected('pearl-config');
        var pearl = fromPearlConfig(world, pearlConfig).step();
        var tnt = fromTntConfig(world, pearl, tntConfig);

        var v0 = tnt.getInitialVelocity(inputs.n1, inputs.n2);
        var traj = world.createPearlTrajectory(pearl.r0, v0.add(pearl.v0));
        var resultTable = [
            ['游戏刻', '速度', '位置', '区块位置']
        ];
        for (var i = 1; i <= inputs.ticks; i++){
            var v = traj.getVelocity(i), pos = traj.getPosition(i);
            resultTable.push([i, v, pos, [pos.x >> 4, pos.z >> 4]]);
        }
        return {
            tntConfigName: tntConfig.name,
            pearlConfigName: pearlConfig.name,
            resultTable: resultTable
        };
    }
};