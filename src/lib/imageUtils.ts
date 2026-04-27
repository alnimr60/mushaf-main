export const getPageImageUrl = (page: number, riwaya: any) => {
  const { repoName, extension = 'webp', imagePath, branch = 'main' } = riwaya;
  const GITHUB_USERNAME = 'alnimr60';

  if (repoName) {
    // riwaya repositories (like warsh-azrk) usually have images at the root
    return `https://cdn.jsdelivr.net/gh/${GITHUB_USERNAME}/${repoName}@${branch}/${page}.${extension}`;
  }

  if (imagePath?.startsWith('http')) {
    return `${imagePath}/${page}.${extension}`;
  }
  
  // Fallback to a default high-quality Mushaf source if no repo is specified
  return `https://raw.githubusercontent.com/risan/quran-images/master/images/${page}.png`;
};
