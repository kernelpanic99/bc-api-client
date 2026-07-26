{pkgs, ...}: {
  languages = {
    javascript = {
      enable = true;
      package = pkgs.nodejs_24;

      pnpm = {
        enable = true;
        package = pkgs.pnpm_11;
      };
    };
  };
}
