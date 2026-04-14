ASSETS — PERSONA // CV
======================

Arquivos nesta pasta:

- avatar.svg        Placeholder do retrato. Substitua pelo seu (SVG, PNG ou JPG).
                    Se usar outro formato, troque o src em index.html (#sobre).

- qrcode.min.js     Biblioteca davidshimjs/qrcodejs (MIT, ~20KB).
                    Única dependência externa — baixada localmente para
                    funcionar offline e sem build.

- bgm.mp3           (não incluso) Coloque aqui a trilha sonora de fundo
                    se quiser usar o botão ♪ BGM no menu.
                    Arquivo MP3 qualquer, sem autoplay — só toca ao clicar.

Como editar seus dados:

1. index.html        -> Troque todos os #TODO (nome, bio, experiência,
                        projetos, links).
2. pix.js            -> Edite PIX_CONFIG no topo com sua chave Pix,
                        nome (sem acento, MAIÚSCULO, máx 25 chars) e
                        cidade (sem acento, MAIÚSCULO, máx 15 chars).
3. Teste: abra index.html no browser e valide o QR Pix no app do
   seu banco antes de publicar.
