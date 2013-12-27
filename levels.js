'use strict;'

//1024x768
var level1 = {
        'sources' : [{'x' : 100, 'y' : 0, 'w' : 100, 'vx' : 0, 'vy' : 0.5}],
        'nParticles' : 100,
        'influencers' : [{'x' : 100, 'y' : 200},
                         {'x' : 100, 'y' : 300},
                         {'x' : 100, 'y' : 400}],
        'portals' : [],
        'buckets' : [{'x' : 568, 'y' : 900, 'w' : 200, 'h' : 25}],
        'obstacles' : [{'x' : 0, 'y' : 700, 'w' : 200, 'h' : 50, 'theta' : 0, 'reaction' : 1}]
    };

var level2 = {
        'sources' : [{'x' : 768 * 0.5 - 50, 'y' : 0, 'w' : 100, 'vx' : 0, 'vy' : 0.5}],
        'nParticles' : 100,
        'influencers' : [{'x' : 100, 'y' : 300},
                         {'x' : 100, 'y' : 400},
                         {'x' : 100, 'y' : 500}],
        'portals' : [],
        'buckets' : [{'x' : 100, 'y' : 1000, 'w' : 100, 'h' : 25},
                     {'x' : 568, 'y' : 1000, 'w' : 100, 'h' : 25}],
        'obstacles' : [{'x' : 768 * 0.5 - 50, 'y' : 300, 'w' : 100, 'h': 10, 'theta' : 0, 'reaction' : 1}]
    };

var level3 = {
        'sources' : [{'x' : 768 * 0.5 - 50, 'y' : 0, 'w' : 100, 'vx' : 0, 'vy' : 0.5}],
        'nParticles' : 100,
        'influencers' : [{'x' : 100, 'y' : 300},
                         {'x' : 100, 'y' : 400},
                         {'x' : 100, 'y' : 500}],
        'portals' : [],
        'buckets' : [{'x' : 200, 'y' : 500, 'w' : 200, 'h' : 25}],
        'obstacles' : [{'x' : 250, 'y' : 200, 'w' : 100, 'h': 10, 'theta' : 0, 'reaction' : 1}]
    };

var level4 = {
        'sources' : [{'x' : 768 * 0.5 - 50, 'y' : 0, 'w' : 100, 'vx' : 0, 'vy' : 0.5}],
        'nParticles' : 100,
        'influencers' : [{'x' : 200, 'y' : 300},
                         {'x' : 400, 'y' : 400},
                         {'x' : 230, 'y' : 500}],
        'portals' : [{'xin' : 50, 'yin' : 300, 'win' : 100, 'hin': 25, 'thetain' : 0, 'xout' : 500, 'yout' : 100, 'wout' : 50, 'hout': 25, 'thetaout' : 0}],
        'buckets' : [{'x' : 500, 'y' : 500, 'w' : 100, 'h' : 25}],
        'obstacles' : [{'x' : 300, 'y' : 300, 'w' : 100, 'h' : 10, 'theta' : 0, 'reaction' : 1}]
    };

