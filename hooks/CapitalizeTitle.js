function Capitalize(title) {
  const stringConvert = title.trim().toLowerCase()
  return stringConvert.replace(/(^|\s)\S/g, (l) => l.toUpperCase());
}

export default Capitalize;