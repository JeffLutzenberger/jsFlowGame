'use strict;'

var level1 = {
        'sourceWidth' : 100,
        'sourceX' : 100,
        'sourceY' : 0,
        'nParticles' : 100,
        'influencers' : [{'x' : 200, 'y' : 100},
                         {'x' : 400, 'y' : 200},
                         {'x' : 230, 'y' : 300}],
        'channels' : [],
        'buckets' : [{'x' : 500, 'y' : 500, 'w' : 100, 'h' : 25}],
        'obstacles' : [{'x' : 200, 'y' : 300, 'w' : 100, 'h' : 10, 'reaction' : 1}]
    };

var level2 = {
        'sourceWidth' : 200,
        'sourceX' : 200,
        'sourceY' : 0,
        'nParticles' : 100,
        'influencers' : [{'x' : 100, 'y' : 100},
                         {'x' : 200, 'y' : 200},
                         {'x' : 30, 'y' : 300}],
        'channels' : [],
        'buckets' : [{'x' : 100, 'y' : 500, 'w' : 100, 'h' : 25},
                     {'x' : 400, 'y' : 500, 'w' : 100, 'h' : 25}],
        'obstacles' : [{'x' : 250, 'y' : 200, 'w' : 100, 'h': 10, 'reaction' : 1}]
    };

var level3 = {
        'sourceWidth' : 200,
        'sourceX' : 200,
        'sourceY' : 0,
        'nParticles' : 100,
        'influencers' : [{'x' : 100, 'y' : 100},
                         {'x' : 200, 'y' : 200},
                         {'x' : 30, 'y' : 300}],
        'channels' : [],
        'buckets' : [{'x' : 200, 'y' : 500, 'w' : 200, 'h' : 25}],
        'obstacles' : [{'x' : 250, 'y' : 200, 'w' : 100, 'h': 10, 'reaction' : 1}]
    };

var level4 = {
        'sourceWidth' : 100,
        'sourceX' : 100,
        'sourceY' : 0,
        'nParticles' : 100,
        'influencers' : [{'x' : 200, 'y' : 100},
                         {'x' : 400, 'y' : 200},
                         {'x' : 230, 'y' : 300}],
        'channels' : [{'xin' : 50, 'yin' : 300, 'win' : 100, 'rotin' : 0, 'xout' : 500, 'yout' : 100, 'wout' : 50, 'rotout' : 0}],
        'buckets' : [{'x' : 500, 'y' : 500, 'w' : 100, 'h' : 25}],
        'obstacles' : [{'x' : 300, 'y' : 300, 'w' : 100, 'h' : 10, 'reaction' : 1}]
    };

