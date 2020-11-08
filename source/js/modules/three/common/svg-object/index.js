import loadedSvgs from './loader';

class SVGObject {
  constructor({name}) {
    this.name = name;
  }

  async getObject() {
    const svgs = await loadedSvgs;
    const svg = svgs.getObjectByName(this.name);

    return svg;
  }
}

export default SVGObject;
