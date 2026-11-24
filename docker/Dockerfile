# Tizen CLI 6.1 (sdb, tizen) + Node.js 24 + Python 3 for CleanFrame.
# Tizen Studio for Linux exists only for x86_64: build and run with --platform linux/amd64.
FROM node:24-trixie

RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 zip unzip gettext-base libncurses6 libxml2 procps ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

ARG TIZEN_URL=https://download.tizen.org/sdk/Installer/tizen-studio_6.1/web-cli_Tizen_Studio_6.1_ubuntu-64.bin
ENV TIZEN_HOME=/home/node/tizen-studio

# The installer refuses root and wants a destination that does not exist yet.
# It exits 0 even on errors, so check the tools explicitly.
USER node
RUN curl -fsSL -o /tmp/tizen.bin "$TIZEN_URL" \
    && chmod +x /tmp/tizen.bin \
    && /tmp/tizen.bin --accept-license "$TIZEN_HOME" \
    && rm /tmp/tizen.bin \
    && test -x "$TIZEN_HOME/tools/sdb" \
    && test -x "$TIZEN_HOME/tools/ide/bin/tizen"

# Samsung CA certificates for signing, plus the TV extension tools.
RUN "$TIZEN_HOME/package-manager/package-manager-cli.bin" install --accept-license \
      cert-add-on TV-SAMSUNG-Extension-Tools \
    && ls "$TIZEN_HOME/tools/certificate-generator/certificates" >/dev/null

# Signing profiles live in the mounted data folder.
RUN "$TIZEN_HOME/tools/ide/bin/tizen" cli-config "profiles.path=/home/node/tizen-studio-data/profile/profiles.xml" >/dev/null

ENV PATH="/home/node/tizen-studio/tools:/home/node/tizen-studio/tools/ide/bin:/home/node/tizen-studio/package-manager:${PATH}"
# Pre-create mount points so named volumes inherit the node user.
USER root
RUN mkdir -p /work/node_modules /home/node/.sdb /home/node/tizen-studio-data \
    && chown -R node:node /work /home/node/.sdb /home/node/tizen-studio-data
USER node
WORKDIR /work
COPY --chmod=755 entrypoint.sh /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["bash"]
