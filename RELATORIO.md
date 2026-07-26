# 📋 Falatório do Sistema — Gerador de Contratos Victorino Eng

Documento explicativo de tudo que foi construído: o que o sistema faz, como foi
feito, quais decisões foram tomadas e o que você precisa fazer para colocá-lo no ar.

---

## 1. O que você pediu

- Um sistema que **gera contratos** a partir de um formulário.
- Você preenche os **dados do cliente** (podendo ser **PJ** ou **PF**).
- Os **dados da sua empresa (Victorino Eng)** já vêm prontos, sem redigitar.
- O sistema gera o contrato pronto **para o cliente assinar**, por meio de um **link**.
- Hospedar em **GitHub privado**, publicar na **Netlify** e usar **Firebase** como banco.
- Uma alteração no seu contrato: **carência de 6 meses → 1 ano**, com **reajuste de
  +50% no valor da parcela a cada 1 ano**.

Tudo isso foi entregue. ✅

---

## 2. O que o sistema faz (visão geral)

| Recurso | Descrição |
|--------|-----------|
| **Formulário PJ/PF** | Alterna entre Pessoa Jurídica (CNPJ) e Pessoa Física (CPF), mostrando os campos certos. |
| **Empresa fixa** | Dados da Victorino Eng (CNPJ, endereço, representante) já embutidos no modelo. |
| **Geração do contrato** | Monta o contrato completo (8 cláusulas) com os dados preenchidos. |
| **Valores por extenso** | R$ 900,00 vira "novecentos reais" automaticamente. |
| **Link único** | Cada contrato ganha um endereço próprio (`contrato.html?id=...`). |
| **Assinatura digital** | O cliente desenha a assinatura, informa o nome e marca o aceite. |
| **Registro** | Salva assinatura, nome, data/hora e o navegador usado. |
| **PDF / Impressão** | Botão que abre a impressão do navegador (salvar como PDF). |
| **Painel de contratos** | Lista todos os contratos com status **Pendente / Assinado**. |
| **Proteção por senha** | O painel administrativo pede senha para ser acessado. |

---

## 3. As alterações no contrato (o que mudou do seu original)

O texto original tinha:
- **Cláusula 6.1** → fidelidade de **6 meses**.
- **Cláusula 6.2** → multa até o **6º mês**.
- **Cláusula 3.3** → reajuste anual pelo **IGPM/IPCA**.

O sistema agora gera com:

- **Cláusula 6.1** → *"prazo de fidelidade mínimo e obrigatório de **01 (um) ano —
  12 (doze) meses**"*.
- **Cláusula 6.2** → multa compensatória *"até a finalização do **décimo segundo
  (12º) mês**"*.
- **Cláusula 3.3** → *"O valor da mensalidade será reajustado a cada 12 (doze)
  meses (...) mediante acréscimo de **50% (cinquenta por cento)** sobre o valor da
  parcela vigente no período anterior."*

O restante das cláusulas (objeto, propriedade intelectual, setup, bloqueio por
inadimplência, LGPD, foro etc.) foi mantido **idêntico** ao seu contrato.

---

## 4. Como foi construído (arquitetura)

Optei por um **site estático** (HTML + CSS + JavaScript puro), sem framework e sem
etapa de build. Motivos:

- **Deploy simples na Netlify**: é só apontar para o repositório, sem configuração.
- **Zero manutenção de dependências**: nada de `npm install`, versões quebrando etc.
- **Rápido e barato**: roda no navegador; o Firebase (plano gratuito) cobre bem o uso.

### Fluxo de dados

```
[Você no painel] --preenche formulário--> [app.js valida e monta os dados]
        |
        v
[db.js grava no Firestore] --gera--> [link único do contrato]
        |
        v (você envia o link)
[Cliente abre contrato.html] --le--> [sign.js mostra o texto + área de assinatura]
        |
        v (cliente assina)
[db.js atualiza o contrato: status = "assinado" + imagem da assinatura]
        |
        v
[Painel "Contratos" mostra como Assinado] --> [Baixar PDF / Imprimir]
```

### Peças principais

- **`contract-template.js`** — coração do sistema: contém os **dados fixos da
  Victorino Eng** e a função que monta o HTML do contrato a partir dos dados. É aqui
  que ficam as cláusulas e as alterações (fidelidade de 1 ano e reajuste de 50%).
- **`app.js`** — controla o formulário: alternância PJ/PF, máscaras (CNPJ, CPF, CEP),
  validação dos campos obrigatórios e criação do contrato.
- **`sign.js`** — renderiza o contrato para o cliente e implementa a **prancheta de
  assinatura** (canvas que funciona com mouse e toque no celular).
- **`db.js`** — conversa com o Firestore (salvar, buscar, listar, assinar). O SDK do
  Firebase é carregado **sob demanda**, então o site não quebra se o Firebase ainda
  não estiver configurado.
- **`utils.js`** — utilidades: formatação de moeda, **número por extenso** em
  português e máscaras de campos.
- **`list.js`** — a tela de acompanhamento dos contratos.

---

## 5. Tecnologias usadas

| Camada | Tecnologia | Por quê |
|-------|-----------|---------|
| Interface | HTML5 + CSS3 | Simples, rápido, sem build. |
| Lógica | JavaScript (ES Modules) | Nativo do navegador, sem dependências. |
| Banco de dados | Firebase Firestore | Gratuito para o volume esperado, tempo real, fácil. |
| Hospedagem | Netlify | Deploy automático a partir do GitHub, HTTPS grátis. |
| Assinatura | Canvas HTML | Desenho à mão, sem serviços pagos. |
| PDF | Impressão do navegador | Confiável e sem bibliotecas externas. |

---

## 6. Modelo de dados (o que fica salvo no Firestore)

Coleção **`contratos`**, um documento por contrato:

```
id, status ("pendente" | "assinado"), createdAt,
tipoCliente ("PJ" | "PF"),
razaoSocial, cnpj, repNome, repRg, repCpf,        (quando PJ)
nome, cpf, rg, nacionalidade, estadoCivil, profissao,  (quando PF)
endereco { logradouro, numero, complemento, bairro, cidade, uf, cep },
objeto, valorSetup, valorMensalidade, diaVencimento,
dataAssinatura, cidadeAssinatura, ufAssinatura,
assinatura { nome, dataURL (imagem), assinadoEm, aceite, userAgent }
```

---

## 7. Segurança

- **Painel protegido por senha** (configurável em `firebase-config.js`).
- **Regras do Firestore** (`firestore.rules`): o cliente só consegue **ler** e
  **assinar** pelo link; **não** pode alterar cláusulas nem apagar contratos.
- **Repositório privado** + link da Netlify **não indexado** (meta `noindex`).
- Para uso intenso, o README explica como ativar o **Firebase Authentication**
  (segurança forte de verdade).

> Observação honesta: a senha do painel é uma proteção **client-side** — ótima
> contra uso casual, mas não é uma barreira criptográfica. Para dados muito
> sensíveis, ative o Authentication conforme o README.

---

## 8. O que já está pronto x o que depende de você

**Pronto (código):**
- ✅ Todo o sistema (formulário, geração, link, assinatura, lista, PDF).
- ✅ Dados da Victorino Eng embutidos.
- ✅ Alterações do contrato (fidelidade 1 ano + reajuste 50%).
- ✅ Regras de segurança e arquivos de deploy.
- ✅ Testado no navegador (geração PJ e PF, máscaras, valores por extenso, layout).

**Depende de você (5–10 minutos, sem programar):**
1. Criar um projeto no **Firebase** e colar as credenciais em `js/firebase-config.js`.
2. Publicar as **regras** do Firestore (arquivo `firestore.rules`).
3. Trocar a **senha do painel**.
4. Conectar o repositório à **Netlify** e publicar.

O passo a passo completo, com telas e cliques, está no **[README.md](README.md)**.

---

## 9. Como testar rápido (antes mesmo do Firebase)

1. Abra o site (ou rode localmente).
2. Entre com a senha do painel.
3. Preencha um cliente e clique em **Pré-visualizar** — o contrato aparece pronto,
   já com as suas alterações. (O botão *Gerar link* só funciona após configurar o
   Firebase.)

---

## 10. Ideias para o futuro (opcional)

- Envio automático do link por **e-mail/WhatsApp** ao gerar o contrato.
- **Login com Firebase Authentication** no painel.
- **Numeração sequencial** de contratos e exportação em lote.
- Registro do **IP** do assinante (exige uma função de servidor simples).
- Campo para **anexar logotipo** da Victorino Eng no cabeçalho do PDF.

---

*Sistema desenvolvido para a Victorino Eng — pronto para configurar e publicar.*
