import { getSelected } from '../configs';
import { fromPearlConfig, fromTntConfig } from './util';
import { Vec3 } from '../lib/pearl';

export default {
    type: 'tnt-amount',
    inputs: {
        'px': ['目标x坐标', 'x'],
        'pz': ['目标z坐标', 'z'],
        'ticks': ['最大游戏刻数', 'ticks']
    }, 
    run: function(world, inputs){
        var tntConfig = getSelected('tnt-config');
        var pearlConfig = getSelected('pearl-config');
        var pearl = fromPearlConfig(world, pearlConfig).step();
        var distination = new Vec3(inputs.px, /* dummy */0, inputs.pz);
        var tnt = fromTntConfig(world, pearl, tntConfig);
        
        var resultTable = [
            ['游戏刻', '初速度', 'TNT用量', '实际到达坐标', '误差距离']
        ];
        for (var i = 1; i <= inputs.ticks; i++){
            var velocity = tnt.solveInitialVelocity(distination, i);
            var tntAmount = tnt.solveTNTAmount(velocity);
            var n1 = tntAmount[0], n2 = tntAmount[1];
            if (n1 >= 0 && n2 >= 0){
                n1 |= 0;
                n2 |= 0;
                var tntAmounts = [
                    [n1, n2], [n1 + 1, n2], [n1, n2 + 1], [n1 + 1, n2 + 1]
                ];
                var selected = 0, selectedDistance = 0, selectedPos;
                for (var j = 0, _a = tntAmounts; j < _a.length; j++){
                    var v = tnt.getInitialVelocity(_a[j][0], _a[j][1]);
                    var actualPos = world.createPearlTrajectory(pearl.r0, v).getPosition(i);
                    var d = actualPos.distance2d2(distination);
                    if (j === 0 || d < selectedDistance){
                        velocity = v;
                        selected = j;
                        selectedDistance = d;
                        selectedPos = actualPos;
                    }
                }
                resultTable.push([
                    i, velocity, tntAmounts[selected], selectedPos, Math.sqrt(selectedDistance)
                ]);
            }
            else {
                resultTable.push([
                    i, velocity, tntAmount, '(无意义)', '(无意义)'
                ]);
            }
        }

        return {
            tntConfigName: tntConfig.name,
            pearlConfigName: pearlConfig.name,
            resultTable: resultTable
        };
    }
};
