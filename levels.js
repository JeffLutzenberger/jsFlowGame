'use strict;'

var level1 = {
        'sourceWidth' : 200,
        'sourceX' : 100,
        'sourceY' : 0,
        'nParticles' : 100,
        'influencers' : [{'x' : 200, 'y' : 100},
                         {'x' : 400, 'y' : 200},
                         {'x' : 230, 'y' : 300}],
        'channels' : [{'xin' : 50, 'yin' : 300, 'win' : 100, 'rotin' : 0, 'xout' : 500, 'yout' : 100, 'wout' : 50, 'rotout' : 0}],
        'buckets' : [{'x' : 500, 'y' : 500, 'width' : 100}],
        'obstacles' : [{'x' : 300, 'y' : 300, 'width' : 100, 'reaction' : 1}]
    };

var level2 = {
        'sourceWidth' : 200,
        'sourceX' : 100,
        'sourceY' : 0,
        'nParticles' : 100,
        'influencers' : [{'x' : 100, 'y' : 100},
                         {'x' : 200, 'y' : 200},
                         {'x' : 30, 'y' : 300}],
        'channels' : [{'xin' : 150, 'yin' : 100, 'win' : 100, 'rotin' : 0, 'xout' : 250, 'yout' : 300, 'wout' : 100, 'rotout' : 0}],
        'buckets' : [{'x' : 300, 'y' : 500, 'width' : 100}],
        'obstacles' : [{'x' : 300, 'y' : 200, 'width' : 100, 'reaction' : 1}]
    };
