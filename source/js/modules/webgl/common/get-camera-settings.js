const defaultCoords = {x: 0, y: 0, z: 0};

export default (z, isPortrait) => {
  if (isPortrait) {
    return {
      intro: {
        rigPosition: {...defaultCoords, z},
        rigLocalRotation: defaultCoords,
        rigRotation: defaultCoords,
        rigTilt: defaultCoords,
      },
      room: {
        rigPosition: {x: -50, y: -50, z: 600},
        rigLocalRotation: {x: -20, y: 0, z: 0},
        rigRotation: defaultCoords,
        rigTilt: defaultCoords,
      },
    };
  }

  return {
    intro: {
      rigPosition: {...defaultCoords, z},
      rigLocalRotation: defaultCoords,
      rigRotation: defaultCoords,
      rigTilt: defaultCoords,
    },
    room: {
      rigPosition: {x: 0, y: 0, z: 600},
      rigLocalRotation: {x: -5, y: 0, z: 0},
      rigRotation: defaultCoords,
      rigTilt: defaultCoords,
    },
  };
};
