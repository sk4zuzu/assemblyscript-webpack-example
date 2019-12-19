{ pkgs ? import <nixpkgs> {} }:

with pkgs;

stdenv.mkDerivation {
  name = "assemblyscript-webpack-example-env";
  buildInputs = [
    openssl
    git
    gnumake
    jq
    nodejs-12_x
  ];
}

# vim:ts=2:sw=2:et:syn=nix:
