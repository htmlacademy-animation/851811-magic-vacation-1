export function getChild(object, name) {
  return object.children[0].getObjectByName(name);
}
