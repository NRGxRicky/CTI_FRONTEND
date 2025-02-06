function Capitalize(title) {
  try {
    const stringConvert = title.trim().toLowerCase()
    return stringConvert.replace(/(^|\s)\S/g, (l) => l.toUpperCase());
  }
  catch {
    console.log('error al capitalizar')
    return title
  }
}

export default Capitalize;